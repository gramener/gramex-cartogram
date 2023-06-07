import * as topojson from "topojson-client";
import { Topology } from "topojson-specification";
import { select, BaseType, Selection } from "d3-selection";
import { geoPath, geoMercator, GeoProjection } from "d3-geo";

export function cartogram(
  element: SVGElement,
  { width, height, layers = [], projection }: CartogramOptions
): Cartogram {
  const el = select(element);

  // If width and height are not specified, get them from the closest SVG parent.
  const container = el.node()?.closest("svg");
  width = width || container?.viewBox?.animVal?.width || container?.width?.animVal?.value || 0;
  height = height || container?.viewBox?.animVal?.height || container?.height?.animVal?.value || 0;
  const size: [number, number] = [width, height];

  // Default to Mercator projection
  projection = projection || geoMercator();

  // Create a <g id="${layer.id}"> element for each layer. If ID is missing, use `layer-${index}`.
  const layerJoin = el
    .selectAll("g.layer")
    .data(layers)
    .join("g")
    .classed("layer", true)
    .attr("id", (d, i) => d.id || `layer-${i}`)
    .each((layer: CartogramLayer) => {
      const featureCollectionName = Object.keys(layer.data.objects)[0];
      const featureCollection = topojson.feature(
        layer.data,
        featureCollectionName
      ) as unknown as GeoJSON.FeatureCollection;
      // Filter if required
      if (layer.filter)
        featureCollection.features = featureCollection.features.filter(layer.filter);
      // Store converted TopoJSON features in each layer as .features
      layer.features = featureCollection.features;
      // If projection is not defined, fit to the first layer
      if (layer.fitSize || !projection?.center?.()?.[0])
        projection = (projection as GeoProjection).fitSize(size, featureCollection);
    });

  const path = geoPath();
  if (projection) path.projection(projection);

  const features: any[] = [];
  layerJoin.each(function (layer: CartogramLayer) {
    const plugin = plugins[layer.type];
    if (!plugin) return;

    const join = select(this)
      .selectAll(plugin.tag)
      .data(layer.features || [])
      .join(plugin.tag)
      .call((join) => plugin.update(join, { path }))
      .classed("feature", true);
    if (layer.update) join.call(layer.update);
    features.push(join);
  });
  return {
    layers: layerJoin,
    features,
  };
}

const plugins = {
  choropleth: {
    tag: "path",
    update: (join, { path }) => join.attr("d", path),
  },
  cartogram: {
    tag: "circle",
    update: (join, { path }) =>
      join.each(function (d) {
        const [x, y] = path.centroid(d);
        if (x && y) select(this).attr("cx", x).attr("cy", y).attr("r", 5).attr("stroke", "#fff");
      }),
  },
};

// TODO: Add hook to set the attributes

export interface CartogramOptions {
  width?: number;
  height?: number;
  layers: CartogramLayer[];
  projection?: GeoProjection;
}

export interface CartogramLayer {
  type: string;
  data: Topology;
  id?: string;
  filter?: (feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>) => boolean;
  update?: (
    join: Selection<
      SVGElement,
      GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
      BaseType | SVGElement,
      unknown
    >
  ) => void;
  fitSize?: boolean;
  features?: GeoJSON.Feature[];
}

export interface Cartogram {
  // TODO: Be specific about the type of the layers
  layers?: any;
  features?: any[];
}
