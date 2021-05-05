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
import _ from 'lodash';
import { ExsplineHighchartsProps, ExsplineHighchartsStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<ExsplineHighchartsProps>`
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

export default class ExsplineHighcharts extends PureComponent<ExsplineHighchartsProps> {
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and componentDidMount.

  rootElem = createRef<HTMLDivElement>();

  componentDidMount() {
    const root = this.rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  }

  render() {
    // height and width are the height and width of the DOM element as it exists in the dashboard.
    // There is also a `data` prop, which is, of course, your DATA 🎉
    console.log('Approach 1 props', this.props);
    const { data, height, width } = this.props;

    console.log('Plugin props', this.props);
    const dailyChart = {
      chart: {
        type: 'spline',
      },
      title: {
        text: '',
      },
      navigator: {
        enabled: true,
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          // don't display the dummy year
          month: '%e. %b',
          year: '%b',
        },
        title: {
          text: 'Date',
        },
      },
      yAxis: {
        title: {
          text: 'Quantity',
        },
        min: 0,
      },
      tooltip: {
        headerFormat: '<b>{series.name}</b><br>',
        pointFormat: '{point.x:%e. %b}: {point.y:.2f} m',
      },

      plotOptions: {
        spline: {
          marker: {
            enabled: true,
          },
        },
      },
      series: [
        {
          name: '',
          // Define the data points. All series have a dummy year
          // of 1970/71 in order to be compared on the same x axis. Note
          // that in JavaScript, months start at 0 for January, 1 for February etc.
          data: [
            [Date.UTC(1970, 9, 27), 0],
            [Date.UTC(1970, 10, 10), 0.6],
            [Date.UTC(1970, 10, 18), 0.7],
            [Date.UTC(1970, 11, 2), 0.8],
            [Date.UTC(1970, 11, 9), 0.6],
            [Date.UTC(1970, 11, 16), 0.6],
            [Date.UTC(1970, 11, 28), 0.67],
            [Date.UTC(1971, 0, 1), 0.81],
            [Date.UTC(1971, 0, 8), 0.78],
            [Date.UTC(1971, 0, 12), 0.98],
            [Date.UTC(1971, 0, 27), 1.84],
            [Date.UTC(1971, 1, 10), 1.8],
            [Date.UTC(1971, 1, 18), 1.8],
            [Date.UTC(1971, 1, 24), 1.92],
            [Date.UTC(1971, 2, 4), 2.49],
            [Date.UTC(1971, 2, 11), 2.79],
            [Date.UTC(1971, 2, 15), 2.73],
            [Date.UTC(1971, 2, 25), 2.61],
            [Date.UTC(1971, 3, 2), 2.76],
            [Date.UTC(1971, 3, 6), 2.82],
            [Date.UTC(1971, 3, 13), 2.8],
            [Date.UTC(1971, 4, 3), 2.1],
            [Date.UTC(1971, 4, 26), 1.1],
            [Date.UTC(1971, 5, 9), 0.25],
            [Date.UTC(1971, 5, 12), 0],
          ],
        },
      ],
    };

    return (
      <Styles
        ref={this.rootElem}
        boldText={this.props.boldText}
        headerFontSize={this.props.headerFontSize}
        height={height}
        width={width}
      >
        <div>
          <HighchartsReact allowChartUpdate highcharts={Highcharts} options={dailyChart} />
        </div>
      </Styles>
    );
  }
}
