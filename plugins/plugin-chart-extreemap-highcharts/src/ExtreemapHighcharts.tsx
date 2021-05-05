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
import { ExtreemapHighchartsProps, ExtreemapHighchartsStylesProps } from './types';

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

export default class ExtreemapHighcharts extends PureComponent<ExtreemapHighchartsProps> {
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

    const treeData: never[] = [];

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
          data: treeData,
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
