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
 * specific language governing permissions and mitations
 * under the License.
 */
import React, { PureComponent, createRef } from 'react';
import { styled } from '@superset-ui/core';
import * as d3 from 'd3';
import { ExsuburstD3JsProps, ExsuburstD3JsStylesProps } from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<ExsuburstD3JsStylesProps>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  overflow-y: scroll;
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default class ExsuburstD3Js extends PureComponent<ExsuburstD3JsProps> {
  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and componentDidMount.

  rootElem = createRef<HTMLDivElement>();

  componentDidMount() {
    const root = this.rootElem.current as HTMLElement;
    console.log('Plugin element', root);
    this.renderChart();
  }


  addValue(label, value, map) {
    for (const obj of map) {
      if(obj.name == label){
        return obj;
      }  
    }
    var added = {name:label, children:[]};
    map.push(added);
    return added;
  }

  renderChart() {
    const rootEl = this.rootElem.current as HTMLElement;
    const { data } = this.props;
    //const data = origData.map(a => ({ name: a.ProductName, value: a['SUM(CurrentLevel)'] }));

    let treeMap = {
      name: "root",
      children: []
    };

    const keys = Object.keys(data[0]);
   
    for (const obj of data) {
      if(obj[keys[0]] == "")
        continue;

      let rootObj = treeMap;
      for (let i = 0; i < keys.length - 1; i++) {
        const value = obj[keys[keys.length - 1]];
        const label = obj[keys[i]];
        rootObj = this.addValue(label, value, rootObj.children);
        if(i == keys.length - 2)
          rootObj.value = value;
      }  
    }

    /*treeMap = {
      name: "flare"
      children:[
        {name: " analytics analytics analytics analytics",value: 200},
        {name: "animate animate animate ",value: 100}
      ]
    };*/

    const width = 500;
    const height = 500;
    
    console.log('Plugin renderChart', this.props);
    console.log('Plugin renderChart data', treeMap);

    const div = d3.select(rootEl);
    div.selectAll('*').remove();
    const svg = div.append('svg').attr('viewBox', [0, 0, width, height]);
    svg.style("font", "6px sans-serif");

    const partition = data => {
      const root = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value);
      return d3.partition()
          .size([2 * Math.PI, root.height + 1])
        (root);
    };

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, treeMap.children.length + 1));

    const format = d3.format(",d");

    const radius = width / 6;

    const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const arcVisible = (d) => {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    };

    const labelVisible = (d) => {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    };
  
    const labelTransform = (d) => {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    };

    const root = partition(treeMap);
    root.each(d => d.current = d);

    const g = svg.append('g').attr('transform', `translate(${width / 2},${width / 2})`);

    const path = g
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      .join('path')
      .attr('fill', d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr('fill-opacity', d => (arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0))
      .attr('d', d => arc(d.current));

    path
      .filter(d => d.children)
      .style('cursor', 'pointer')
      .on('click', clicked);

    path.append('title').text(
      d =>
        `${d
          .ancestors()
          .map(d => d.data.name)
          .reverse()
          .join('/')}\n${format(d.value)}`,
    );

    const label = g
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      .join('text')
      .attr('dy', '0.35em')
      .attr('fill-opacity', d => Number(labelVisible(d.current)))
      .attr('transform', d => labelTransform(d.current))
      .text(d => { return d.data.name.substring(0,25) });

    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each(
        d =>
          (d.target = {
            x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
            y0: Math.max(0, d.y0 - p.depth),
            y1: Math.max(0, d.y1 - p.depth),
          }),
      );

      

      const t = g.transition().duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path
        .transition(t)
        .tween('data', d => {
          const i = d3.interpolate(d.current, d.target);
          return t => (d.current = i(t));
        })
        .filter(function (d) {
          return Number(this.getAttribute('fill-opacity')) || arcVisible(d.target);
        })
        .attr('fill-opacity', d => (arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0))
        .attrTween('d', d => () => arc(d.current));

      label
        .filter(function (d) {
          return Number(this.getAttribute('fill-opacity')) || labelVisible(d.target);
        })
        .transition(t)
        .attr('fill-opacity', d => Number(labelVisible(d.target)))
        .attrTween('transform', d => () => labelTransform(d.current));
    }
  }

  render() {
    // height and width are the height and width of the DOM element as it exists in the dashboard.
    // There is also a `data` prop, which is, of course, your DATA 🎉
    console.log('Approach 1 props', this.props);

    const { height} = this.props;
    /*const width = 500;
    const height = 500;*/
   
    console.log('Plugin props', this.props);
    this.renderChart();

    return (
      <Styles
        ref={this.rootElem}
        boldText={this.props.boldText}
        headerFontSize={this.props.headerFontSize}
        height={height}
        width={height}
      >
        <div></div>
      </Styles>
    );
  }
}
