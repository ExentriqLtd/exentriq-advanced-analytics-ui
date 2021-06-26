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
import React, { useEffect, useState, createRef } from 'react';
import { styled } from '@superset-ui/core';
import { Button, Table } from 'react-bootstrap';
import moment from 'moment';
import { ExdownloadDataProps, ExdownloadDataStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<ExdownloadDataStylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  margin-top: ${({ theme }) => theme.gridUnit * 4}px;
  overflow: auto;
`;

const Scrollable = styled.div<ExbarHighchartsProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  border: 1px solid #3333;
  margin-top: ${({ theme }) => theme.gridUnit * 4}px;
  overflow-y: scroll;
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function ExdownloadData(props: ExdownloadDataProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, queries, serviceApi, momentFormat, dataset, headerCsv } = props;
  const [isLoading, setLoading] = useState(false);
  const [downloads, setDownloads] = useState();

  const rootElem = createRef<HTMLDivElement>();

  const fetchDownloadList = async (request: any) => {
    fetch(`${serviceApi}/getDownloads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
      .then(response => response.json())
      .then(responseData => {
        console.log('finalData -->', responseData);
        setDownloads(responseData);
      })
      .catch(error => {
        setDownloads([]);
        console.error('Error:', error);
      });
  };

  const fetchCreateDownload = async (request: any) => {
    fetch(`${serviceApi}/generateDownload/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
      .then(response => response.json())
      .then(responseData => {
        setLoading(false);
        fetchDownloadList({});
        if (responseData.status !== 'success') {
          alert(responseData.status);
        }
      })
      .catch(error => {
        alert('Error');
        setLoading(false);
      });
  };

  useEffect(() => {
    // chiamo servizio ottengo la lista di downloads
    console.log('getListOfDownloads');
    fetchDownloadList({});
  }, []);

  const generateClick = () => {
    console.log('Handle Click --> ', queries, dataset, headerCsv);
    setLoading(true);
    const request = {
      queries,
      dataset,
      headerCsv,
    };
    fetchCreateDownload(request);
  };

  const refreshClick = () => {
    fetchDownloadList({});
  };

  if (!downloads) return null;

  return (
    <Styles ref={rootElem} height={height} width={width}>
      <Button
        className="btn-sm"
        disabled={isLoading}
        onClick={!isLoading ? generateClick : null}
      >
        {isLoading ? 'Generating…' : 'Generate'}
      </Button>
      <Button className="btn-sm m-l-10" onClick={refreshClick}>
        Refresh
      </Button>

      <Scrollable height={height - 70} width={width}>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Size</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {downloads.map((el: any) => {
              const link = `${serviceApi}/getFile?path=${el.path}`;
              const timestamp = moment(new Date(el.timestamp)).format(momentFormat);
              return (
                <tr key={el._id}>
                  <td>{el.title}</td>
                  <td>{timestamp}</td>
                  <td>{el.status}</td>
                  <td>{el.total}</td>
                  <td>
                    <a href={link} target="_blank">
                      Download
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Scrollable>
    </Styles>
  );
}
