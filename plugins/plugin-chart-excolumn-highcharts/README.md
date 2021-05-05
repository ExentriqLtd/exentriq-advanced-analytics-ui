## @superset-ui/plugin-chart-excolumn-highcharts



This plugin provides Excolumn Highcharts for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import ExcolumnHighchartsChartPlugin from '@superset-ui/plugin-chart-excolumn-highcharts';

new ExcolumnHighchartsChartPlugin()
  .configure({ key: 'excolumn-highcharts' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-excolumn-highcharts) for more details.

```js
<SuperChart
  chartType="excolumn-highcharts"
  width={600}
  height={600}
  formData={...}
  queryData={{
    data: {...},
  }}
/>
```

### File structure generated

```
├── package.json
├── README.md
├── tsconfig.json
├── src
│   ├── ExcolumnHighcharts.tsx
│   ├── images
│   │   └── thumbnail.png
│   ├── index.ts
│   ├── plugin
│   │   ├── buildQuery.ts
│   │   ├── controlPanel.ts
│   │   ├── index.ts
│   │   └── transformProps.ts
│   └── types.ts
├── test
│   └── index.test.ts
└── types
    └── external.d.ts
```