## @superset-ui/plugin-chart-exdownload-data

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-exdownload-data.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-exdownload-data)

This plugin provides Exdownload Data for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import ExdownloadDataChartPlugin from '@superset-ui/plugin-chart-exdownload-data';

new ExdownloadDataChartPlugin()
  .configure({ key: 'exdownload-data' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-exdownload-data) for more details.

```js
<SuperChart
  chartType="exdownload-data"
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
│   ├── ExdownloadData.tsx
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