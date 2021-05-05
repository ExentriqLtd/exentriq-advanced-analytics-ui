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
import { ExbarHighchartsProps, ExbarHighchartsStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<PluginExbarHighchartsStylesProps>`
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

export default class ExbarHighcharts extends PureComponent<ExbarHighchartsProps> {
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
    console.log('Plugin props', this.props);
    const { data, height, width } = this.props;
    console.log('Plugin data', data);

    const orderedData = _.orderBy(data, 'CurrentLevel', 'asc');

    const categories = _.map(orderedData, 'ProductName');
    const currentLevel = _.map(orderedData, 'CurrentLevel');
    const reorderPoint = _.map(orderedData, 'ReorderPoint');

    let chartHeight = 50 * categories.length;
    if (chartHeight < 200) chartHeight = 200;

    // Inventory Bar Chart
    const optionsBarChart = {
      chart: {
        type: 'bar',
        height: chartHeight,
      },
      colors: ['#0277bd', '#fb8b38'],
      title: {
        text: '',
      },
      xAxis: {
        categories,
        title: {
          text: null,
        },
      },
      yAxis: {
        title: {
          text: 'Quantity',
          align: 'high',
        },
        labels: {
          overflow: 'justify',
        },
        max: 20000,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            formatter() {
              if (this.point.series.name == 'Reorder Point') return '';
              return this.y;
            },
          },
        },
        scrollbar: {
          enabled: true,
        },
        series: {
          grouping: false,
          negativeColor: '#FF0000',
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        floating: false,
        borderWidth: 1,
        backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
        shadow: true,
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Current Level',
          data: currentLevel,
        },
        {
          name: 'Reorder Point',
          data: reorderPoint,
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
          <HighchartsReact allowChartUpdate highcharts={Highcharts} options={optionsBarChart} />
        </div>
      </Styles>
    );
  }
}
