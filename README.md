# @gramex/cartogram

A layered map visual that renders choropleths and cartograms from TopoJSON files.

## Example

Given this [TopoJSON file of Japan](docs/japan.json), you can render a map like this:

[![Japan map](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/japan.png)](docs/japan.html ":include")

[Here is the source code for the map above](docs/japan.html ":include :type=code")

## Installation

Install via `npm`:

```bash
npm install @gramex/cartogram
```

Use locally as an ES module:

```html
<script type="module">
  import { cartogram } from "./node_modules/@gramex/cartogram/index.js";
</script>
```

Use locally as a script:

```html
<script src="./node_modules/@gramex/cartogram/cartogram.min.js"></script>
<script>
  gramex.cartogram(...)
</script>
```

Use via CDN as an ES Module:

```html
<script type="module">
  import { cartogram } from "https://cdn.jsdelivr.net/npm/@gramex/cartogram@1/cartogram.js";
</script>
```

Use via CDN as a script:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/cartogram@1/cartogram.min.js"></script>
<script>
  gramex.cartogram(...)
</script>
```

## API

The `cartogram()` function accepts the following parameters:

- `element`: the SVG element to render the map in. This may be an `<svg>` or a `<g>` element.
- `options`: an object with the following keys
  - `layers`: an array of layers. Each layer draws a map. It's an object with these keys:
    - `type`: `"choropleth"`, `"cartogram"` or `"centroid"`
    - `data`: a [TopoJSON map](https://github.com/topojson/topojson) object
    - `id`: optional ID for the map layer;
    - `filter`: optional function to filter which features are drawn, e.g. `(d) => d.properties.population > 1000000`
    - `update`: optional function to update the map features, e.g. `(join) => join.attr('fill', d => d.color)`
    - `fit`: optional boolean. If true, the projection automatically fits to the boundary of this layer
  - `projection`: Any [d3-geo projection](https://github.com/d3/d3-geo)
  - `width`: optional width of the map. Defaults to the element's size (or the nearest SVG parent)
  - `height`: optional width of the map. Defaults to the element's size (or the nearest SVG parent)

## Color features

Add an `update` function to color features based on data.

[![Map with colors](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/color.png)](docs/color.html ":include")

[Source code](docs/color.html ":include :type=code")

## Resize features

Add an `update` function to set any attribute on features based on data.

[![Map with resized circles](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/features.png)](docs/features.html ":include")

[Source code](docs/features.html ":include :type=code")

## Animate features

Use `.transition()` on in `update` to animate the map.

[![Map with animation](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/animate.gif)](docs/animate.html ":include")

[Source code](docs/animate.html ":include :type=code")

## Add shapes at centroid

The `"centroid"` layer type lets you add any shape to the map. This example adds a square and a label at the centroid of each feature.

[![Map with squares at centroid](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/centroid.png)](docs/centroid.html ":include")

[Source code](docs/centroid.html ":include :type=code")

## Filter features

The `filter` function is called with each feature. Features are objects with the following keys:

- `type`: `"Feature"`
- `properties`: An object with the properties of the feature. This varies by map.
- `geometry`: An object with the geometry of the feature. Use [d3-geo](https://github.com/d3/d3-geo) to process this

This example draws 2 layers. The second layer filters selected features and colors it in red.

[![Map with filters](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/filter.png)](docs/filter.html ":include")

[Source code](docs/filter.html ":include :type=code")

## Zoom to fit

By default, cartogram zooms to fit all layers. To zoom to specific layers, add `fit: true` to the layers.

[![Map with transformations](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/fit.png)](docs/fit.html ":include")

[Source code](docs/fit.html ":include :type=code")

## Multiple maps

You can add different maps in each layer. In this map, we have one layer for France (red) and one for Germany (green).

[![Multiple maps](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/multiple.png)](docs/multiple.html ":include")

[Source code](docs/multiple.html ":include :type=code")

## Add tooltips

This example shows how to use [Bootstrap tooltips](https://getbootstrap.com/docs/5.3/components/tooltips/).

1. Add a `data-bs-toggle="tooltip" title="..."` attribute to each feature using `update`
2. Call `new bootstrap.Tooltip(element, {selector: '[data-bs-toggle="tooltip"]'})` to initialize tooltips

[Example](docs/tooltip.html ":include")

[Source code](docs/tooltip.html ":include :type=code")

## Change projection

This example shows how to pass a [d3-geo projection](https://github.com/d3/d3-geo) as `projection`.

[![Map with projection](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/projection.png)](docs/projection.html ":include")

[Source code](docs/projection.html ":include :type=code")

## Transform SVG

`cartogram()` works on any `<svg>` or `<g>` element, and respects all transformations.

[![Map with transformations](https://raw.githubusercontent.com/gramener/gramex-cartogram/main/docs/transform.png)](docs/transform.html ":include")

[Source code](docs/transform.html ":include :type=code")

## Documentation

- [**Home page**](https://github.gramener.io/gramex-cartogram/)
- [**Source**](https://github.com/gramener/gramex-cartogram)

## Release notes

- 2.0.3: 18 Aug 2024. Security fix.
- 2.0.2: 1 Nov 2023. Include README.md in npm package. Lint code before publishing.
- 2.0.1: 31 Oct 2023. Re-license from AGPL 3.0 to MIT.
- 2.0.0: 16 Jun 2023. Build as `gramex.cartogram()` instead of `cartogram.cartogram()`.
- 1.1.0: 8 Jun 2023. Add `type="centroid"`. Support transitions. `fit` supports multiple layers.
- 1.0.1: 7 Jun 2023. Initial release

## Authors

Anand S <s.anand@gramener.com>

## License

[MIT](https://spdx.org/licenses/MIT.html)
