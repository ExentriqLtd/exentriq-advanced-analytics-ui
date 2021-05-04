## @superset-ui/plugin-chart-custom-table

[![Version](https://img.shields.io/npm/v/@superset-ui/plugin-chart-custom-table.svg?style=flat-square)](https://www.npmjs.com/package/@superset-ui/plugin-chart-custom-table)

This plugin provides Custom Table for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import CustomTableChartPlugin from '@superset-ui/plugin-chart-custom-table';

new CustomTableChartPlugin()
  .configure({ key: 'custom-table' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-custom-table) for more details.

```js
<SuperChart
  chartType="custom-table"
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
│   ├── CustomTable.tsx
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