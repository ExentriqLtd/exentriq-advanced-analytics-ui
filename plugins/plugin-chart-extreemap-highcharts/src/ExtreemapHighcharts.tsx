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
import React, { PureComponent, createRef } from 'react';
import { styled } from '@superset-ui/core';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import addTreemapModule from 'highcharts/modules/treemap';
import _ from 'lodash';
import { ExtreemapHighchartsProps, ExtreemapHighchartsStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<ExtreemapHighchartsStylesProps>`
    padding: ${({ theme }) => theme.gridUnit * 4}px;
    border-radius: ${({ theme }) => theme.gridUnit * 2}px;
    height: ${({ height }) => height};
    width: ${({ width }) => width};
    overflow-y: scroll;
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default class ExtreemapHighcharts extends PureComponent<ExtreemapHighchartsProps> {
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and componentDidMount.

  rootElem = createRef<HTMLDivElement>();

  componentDidMount() {
    const root = this.rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }

  addValue(id: any, parent: any, name: any, path: any, value: any, color: any, treeMap: any) {
    const idx = treeMap.findIndex((el: { id: any; parent: any }) => {
      if (el.id == id && el.parent == parent) return true;
      return false;
    });

    if (idx >= 0) {
      treeMap[idx].value += value;
    } else {
      treeMap.push({
        id,
        name,
        path,
        parent,
        value,
        color,
      });
    }
  }

  getId(obj: any, keys: any, i: any) {
    let id = obj[keys[0]].trim();
    if (id == '') id = 'N/A';
    if (i == 0) return id;
    if (i == -1) return '';
    for (let j = 1; j <= i; j++) {
      id = `${id}_${obj[keys[j]].trim()}`;
    }
    return id;
  }

  getPath(obj: any, keys: any, i: any) {
    let id = obj[keys[0]].trim();
    if (id == '') id = 'N/A';
    if (i == 0) return id;

    if (i == -1) return '';

    for (let j = 1; j <= i; j++) {
      id = `${id} > ${obj[keys[j]].trim()}`;
    }
    return id;
  }

  render() {
    // height and width are the height and width of the DOM element as it exists in the dashboard.
    // There is also a `data` prop, which is, of course, your DATA 🎉
    console.log('Approach 1 props', this.props);
    const { data, height, width } = this.props;

    const treeMap: { value: any }[] = [];
    const keys = Object.keys(data[0]);
    const colorList = ['#7030a0', '#00b050', '#00b0f0', '#c55911'];
    let colorMap = [];
    let colorIdx = 0;

    for (const obj of data) {
      if(obj[keys[0]] == "")
        continue;

      if(!colorMap[this.getId(obj, keys, 0)]){
        colorMap[this.getId(obj, keys, 0)] = colorList[colorIdx];
        colorIdx ++;
        colorIdx = colorIdx % colorList.length;
      }
      const color = colorMap[this.getId(obj, keys, 0)];
      for (let i = 0; i < keys.length-1; i++) {
        const id = this.getId(obj, keys, i);
        const parentId = this.getId(obj, keys, i - 1);
        const value = obj[keys[keys.length - 1]];
        const label = obj[keys[i]];
        const path = this.getPath(obj, keys, i);
        this.addValue(id, parentId, label, path, value, color, treeMap);
      }
    }

    console.log('Plugin props', treeMap);

    const optionsTreeMap = {
      chart: {
        height: '60%',
      },
      series: [
        {
          type: 'treemap',
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          animationLimit: 1000,
          dataLabels: {
            format: '{point.name}: {point.value}',
            enabled: false,
          },
          levelIsConstant: false,
          levels: [
            {
              level: 1,
              dataLabels: {
                enabled: true,
                style: {
                  fontSize: '14px',
                },
              },
              borderWidth: 3,
            },
          ],
          data: treeMap,
        },
      ],
      title: {
        text: '',
      },
      tooltip: {
        headerFormat: '',
        pointFormat: 'Quantity of <b>{point.path}</b> is <b>{point.value}</b>',
      },
    };
    addTreemapModule(Highcharts);

    return (
      <Styles
        ref={this.rootElem}
        boldText={this.props.boldText}
        headerFontSize={this.props.headerFontSize}
        height={height}
        width={width}
      >
        <div>
          <HighchartsReact allowChartUpdate highcharts={Highcharts} options={optionsTreeMap} />
        </div>
      </Styles>
    );
  }
}
