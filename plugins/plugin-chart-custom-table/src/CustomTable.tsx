/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ColumnInstance, DefaultSortTypes, ColumnWithLooseAccessor } from 'react-table';
import { extent as d3Extent, max as d3Max } from 'd3-array';
import { FaSort, FaSortUp as FaSortAsc, FaSortDown as FaSortDesc } from 'react-icons/fa';
import { t, tn, DataRecordValue, DataRecord } from '@superset-ui/core';

import { TableChartTransformedProps, DataType, DataColumnMeta } from './types';
import DataTable, {
  DataTableProps,
  SearchInputProps,
  SelectPageSizeRendererProps,
  SizeOption,
} from './DataTable';
import Styles from './Styles';
import formatValue from './utils/formatValue';
import { PAGE_SIZE_OPTIONS } from './controlPanel';

type ValueRange = [number, number];

/**
 * Return sortType based on data type
 */
function getSortTypeByDataType(dataType: DataType): DefaultSortTypes {
  if (dataType === DataType.DateTime) {
    return 'datetime';
  }
  if (dataType === DataType.String) {
    return 'alphanumeric';
  }
  return 'basic';
}

/**
 * Cell background to render columns as horizontal bar chart
 */
function cellBar({
  value,
  valueRange,
  colorPositiveNegative = false,
  alignPositiveNegative,
}: {
  value: number;
  valueRange: ValueRange;
  colorPositiveNegative: boolean;
  alignPositiveNegative: boolean;
}) {
  const [minValue, maxValue] = valueRange;
  const r = colorPositiveNegative && value < 0 ? 150 : 0;
  if (alignPositiveNegative) {
    const perc = Math.abs(Math.round((value / maxValue) * 100));
    // The 0.01 to 0.001 is a workaround for what appears to be a
    // CSS rendering bug on flat, transparent colors
    return (
      `linear-gradient(to right, rgba(${r},0,0,0.2), rgba(${r},0,0,0.2) ${perc}%, ` +
      `rgba(0,0,0,0.01) ${perc}%, rgba(0,0,0,0.001) 100%)`
    );
  }
  const posExtent = Math.abs(Math.max(maxValue, 0));
  const negExtent = Math.abs(Math.min(minValue, 0));
  const tot = posExtent + negExtent;
  const perc1 = Math.round((Math.min(negExtent + value, negExtent) / tot) * 100);
  const perc2 = Math.round((Math.abs(value) / tot) * 100);
  // The 0.01 to 0.001 is a workaround for what appears to be a
  // CSS rendering bug on flat, transparent colors
  return (
    `linear-gradient(to right, rgba(0,0,0,0.01), rgba(0,0,0,0.001) ${perc1}%, ` +
    `rgba(${r},0,0,0.2) ${perc1}%, rgba(${r},0,0,0.2) ${perc1 + perc2}%, ` +
    `rgba(0,0,0,0.01) ${perc1 + perc2}%, rgba(0,0,0,0.001) 100%)`
  );
}

function SortIcon<D extends object>({ column }: { column: ColumnInstance<D> }) {
  const { isSorted, isSortedDesc } = column;
  let sortIcon = <FaSort />;
  if (isSorted) {
    sortIcon = isSortedDesc ? <FaSortDesc /> : <FaSortAsc />;
  }
  return sortIcon;
}

function SearchInput({ count, value, onChange }: SearchInputProps) {
  return (
    <span className="dt-global-filter">
      {t('Search')}{' '}
      <input
        className="form-control input-sm"
        placeholder={tn('search.num_records', count)}
        value={value}
        onChange={onChange}
      />
    </span>
  );
}

function SelectPageSize({ options, current, onChange }: SelectPageSizeRendererProps) {
  return (
    <span className="dt-select-page-size form-inline">
      {t('page_size.show')}{' '}
      <select
        className="form-control input-sm"
        value={current}
        onBlur={() => {}}
        onChange={e => {
          onChange(Number((e.target as HTMLSelectElement).value));
        }}
      >
        {options.map(option => {
          const [size, text] = Array.isArray(option) ? option : [option, option];
          return (
            <option key={size} value={size}>
              {text}
            </option>
          );
        })}
      </select>{' '}
      {t('page_size.entries')}
    </span>
  );
}

export default function TableChart<D extends DataRecord = DataRecord>(
  props: TableChartTransformedProps<D> & {
    sticky?: DataTableProps<D>['sticky'];
  },
) {
  const {
    height,
    width,
    data,
    columns: columnsMeta,
    alignPositiveNegative = false,
    colorPositiveNegative = false,
    includeSearch = false,
    pageSize = 0,
    showCellBars = true,
    emitFilter = false,
    sortDesc = false,
    onChangeFilter,
    filters: initialFilters,
    sticky = true, // whether to use sticky header
    annotationColumn,
    annotationLabel,
    annotationUsers,
    dashboardInfo,
    serviceApi,
    spaceId,
    annotationObj,
    alignConfig,
    colorConfig,
    indexColumn,
  } = props;

  const [filters, setFilters] = useState(initialFilters);
  const [finalData, setFinalData] = useState();
  const [triggerAnnotation, setTriggerAnnotation] = useState();

  // only take relevant page size options
  const pageSizeOptions = useMemo(
    () => PAGE_SIZE_OPTIONS.filter(([n, _]) => n <= 2 * data.length) as SizeOption[],
    [data.length],
  );

  useEffect(() => {
    window.addEventListener(
      'message',
      event => {
        if (event.data && event.data === 'reloadAnnotation') {
          setTriggerAnnotation(new Date().getTime());
        }
      },
      false,
    );
  }, []);

  useEffect(() => {
    let annotationEnabled = true;
    if (annotationUsers && dashboardInfo) {
      annotationEnabled = annotationUsers.split(',').includes(dashboardInfo.userId);
    }

    if (annotationColumn && annotationEnabled) {
      // get annotations
      const request = {
        id: 3,
        method: 'approvalCommentsServiceImpl.countListApprovalCommentsByObjectIdAndApp',
        params: [spaceId, annotationObj, 'ANNOTATION'],
      };

      // 'https://www.exentriq.com/JSON-RPC' [90302, 90302, 'ANNOTATION']
      const fetchAnnotations = async () => {
        fetch(serviceApi, {
          method: 'POST',
          body: JSON.stringify(request),
        })
          .then(response => response.json())
          .then(responseData => {
            const annotationsMap = responseData.result.map;
            const annotationsLC = Object.keys(annotationsMap).reduce((destination, key) => {
              destination[key.replace(/ /g, '_').toLowerCase()] = annotationsMap[key];
              return destination;
            }, {});

            const dataWithAnnotations = data.map(obj => {
              const key = obj[annotationColumn]
                ? obj[annotationColumn].replace(/ /g, '_').toLowerCase()
                : null;
              const count = annotationsLC[key];
              return {
                ...obj,
                AnnotationKeyColumn: { key, count },
              };
            });

            setFinalData(dataWithAnnotations);
            console.log('finalData -->', dataWithAnnotations, annotationColumn);
          })
          .catch(error => {
            setFinalData(data);
            console.error('Error:', error);
          });
      };

      fetchAnnotations();
    } else {
      setFinalData(data);
    }
  }, [triggerAnnotation, data]);

  const getValueRange = useCallback(
    function getValueRange(key: string) {
      if (typeof data?.[0]?.[key] === 'number') {
        const nums = data.map(row => row[key]) as number[];
        return (alignPositiveNegative
          ? [0, d3Max(nums.map(Math.abs))]
          : d3Extent(nums)) as ValueRange;
      }
      return null;
    },
    [alignPositiveNegative, data],
  );

  const isActiveFilterValue = useCallback(
    function isActiveFilterValue(key: string, val: DataRecordValue) {
      return !!filters && filters[key]?.includes(val);
    },
    [filters],
  );

  const toggleFilter = useCallback(
    function toggleFilter(key: string, val: DataRecordValue) {
      const updatedFilters = { ...(filters || {}) };
      if (filters && isActiveFilterValue(key, val)) {
        updatedFilters[key] = filters[key].filter((x: DataRecordValue) => x !== val);
      } else {
        updatedFilters[key] = [...(filters?.[key] || []), val];
      }
      setFilters(updatedFilters);
      if (onChangeFilter) {
        onChangeFilter(updatedFilters);
      }
    },
    [filters, isActiveFilterValue, onChangeFilter],
  );

  const getColumnConfigs = useCallback(
    (column: DataColumnMeta, i: number): ColumnWithLooseAccessor<D> => {
      const { key, label, dataType } = column;
      let className = '';
      if (dataType === DataType.Number) {
        className += ' dt-metric';
      } else if (emitFilter) {
        className += ' dt-is-filter';
      }
      const valueRange = showCellBars && getValueRange(key);

      return {
        id: String(i), // to allow duplicate column keys
        // must use custom accessor to allow `.` in column names
        // typing is incorrect in current version of `@types/react-table`
        // so we ask TS not to check.
        accessor: ((datum: D) => datum[key]) as never,
        Cell: ({ column: col, value }: { column: ColumnInstance<D>; value: DataRecordValue }) => {
          // console.log("Column Col", col);
          const [isHtml, text] = formatValue(column, value);
          const align = alignConfig ? alignConfig[col.id] : null;
          const customColor = colorConfig ? colorConfig[col.id] : [];

          const textColor = customColor
            ? customColor.find(a => {
                return parseFloat(value) <= a.value;
              })
            : {};

          const style = {
            background: valueRange
              ? cellBar({
                  value: value as number,
                  valueRange,
                  alignPositiveNegative,
                  colorPositiveNegative,
                })
              : undefined,
            textAlign: align,
            color: textColor ? textColor.color : null,
          };
          const html = isHtml ? { __html: text } : undefined;
          const cellProps = {
            // show raw number in title in case of numeric values
            title: typeof value === 'number' ? String(value) : undefined,
            onClick: emitFilter && !valueRange ? () => toggleFilter(key, value) : undefined,
            className: `${className}${
              isActiveFilterValue(key, value) ? ' dt-is-active-filter' : ''
            }`,
            style,
          };
          if (html) {
            // eslint-disable-next-line react/no-danger
            return <td {...cellProps} dangerouslySetInnerHTML={html} />;
          }
          // If cellProps renderes textContent already, then we don't have to
          // render `Cell`. This saves some time for large tables.
          return <td {...cellProps}>{text}</td>;
        },
        Header: ({ column: col, title, onClick, style }) => {
          const align = alignConfig ? alignConfig[col.id] : null;
          const styleHeader = {
            ...style,
            textAlign: align,
          };
          return (
            <th
              title={title}
              className={col.isSorted ? `${className || ''} is-sorted` : className}
              style={styleHeader}
              onClick={onClick}
            >
              {label}
              <SortIcon column={col} />
            </th>
          );
        },
        sortDescFirst: sortDesc,
        sortType: getSortTypeByDataType(dataType),
      };
    },
    [
      alignPositiveNegative,
      colorPositiveNegative,
      emitFilter,
      getValueRange,
      isActiveFilterValue,
      showCellBars,
      sortDesc,
      toggleFilter,
    ],
  );

  const columns = useMemo(() => {
    return columnsMeta.map(getColumnConfigs);
  }, [columnsMeta, getColumnConfigs]);

  const showAnnotations = (param: any) => {
    const { tag } = param;
    if (window.parent) {
      window.parent.postMessage({ action: 'open_view_annotations', tag }, '*');
    }
  };

  let annotationEnabled = true;
  if (annotationUsers && dashboardInfo) {
    annotationEnabled = annotationUsers.split(',').includes(dashboardInfo.userId);
  }

  if (!finalData) return null;

  if (annotationColumn && annotationEnabled) {
    columns.unshift({
      id: String(columns.length),
      accessor: 'AnnotationKeyColumn',
      Header: () => {
        return <th>{annotationLabel}</th>;
      },
      Cell: ({ column: col, value }) => {
        const color = value.count > 0 ? '#4a4a4a' : '#c0c0c0';
        return (
          <td>
            <a onClick={() => showAnnotations({ tag: value.key })}>
              {value.count > 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill={color}
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              ) : (
                'Add'
              )}
            </a>
          </td>
        );
      },
    });
  }

  if (indexColumn) {
    columns.unshift({
      id: String(columns.length),
      accessor: 'IndexKeyColumn',
      Header: () => {
        return <th>Idx</th>;
      },
      Cell: ({ column: col, value, row }) => {
        console.log('RowValue', row);
        return <td>{row.id}</td>;
      },
    });
  }

  return (
    <Styles>
      <DataTable<D>
        columns={columns}
        data={finalData}
        tableClassName="table table-striped table-condensed"
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        width={width}
        height={height}
        // 9 page items in > 340px works well even for 100+ pages
        maxPageItemCount={width > 340 ? 9 : 7}
        noResults={(filter: string) => t(filter ? 'No matching records found' : 'No records found')}
        searchInput={includeSearch && SearchInput}
        selectPageSize={pageSize !== null && SelectPageSize}
        // not in use in Superset, but needed for unit tests
        sticky={sticky}
      />
    </Styles>
  );
}
