## @superset-ui/plugin-chart-exbar-highcharts



This plugin provides Exbar Highcharts for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import ExbarHighchartsChartPlugin from '@superset-ui/plugin-chart-exbar-highcharts';

new ExbarHighchartsChartPlugin()
  .configure({ key: 'exbar-highcharts' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-exbar-highcharts) for more details.

```js
<SuperChart
  chartType="exbar-highcharts"
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
│   ├── ExbarHighcharts.tsx
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