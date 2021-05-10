## @superset-ui/plugin-chart-exsuburst-d3js



This plugin provides Exsuburst D3Js for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to lookup this chart throughout the app.

```js
import ExsuburstD3JsChartPlugin from '@superset-ui/plugin-chart-exsuburst-d3js';

new ExsuburstD3JsChartPlugin()
  .configure({ key: 'exsuburst-d3js' })
  .register();
```

Then use it via `SuperChart`. See [storybook](https://apache-superset.github.io/superset-ui/?selectedKind=plugin-chart-exsuburst-d3js) for more details.

```js
<SuperChart
  chartType="exsuburst-d3js"
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
│   ├── ExsuburstD3Js.tsx
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