## @superset-ui/plugin-chart-extreemap-highcharts



This plugin provides Extreemap Highcharts for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import ExtreemapHighchartsChartPlugin from '@superset-ui/plugin-chart-extreemap-highcharts';

new ExtreemapHighchartsChartPlugin()
  .configure({ key: 'extreemap-highcharts' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-extreemap-highcharts) for more details.

```js
<SuperChart
  chartType="extreemap-highcharts"
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
│   ├── ExtreemapHighcharts.tsx
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