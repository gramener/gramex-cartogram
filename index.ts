import * as topojson from "topojson-client";
import { Topology } from "topojson-specification";
import { select, BaseType, Selection } from "d3-selection";
import { geoPath, geoMercator, GeoProjection } from "d3-geo";
import "d3-transition";

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
  const layerSelection = el
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

  const features: FeatureSelection[] = [];
  layerSelection.each(function (layer: CartogramLayer) {
    const plugin = plugins[layer.type];
    if (!plugin) return;

    const selection = select(this)
      .selectAll(".feature")
      .data(layer.features || []);
    // TODO: Allow layer.enter() and layer.exit()
    const join = plugin(selection, { path }).classed("feature", true);
    if (layer.update) join.call(layer.update);
    features.push(join);
  });
  return {
    layers: layerSelection,
    features,
  };
}

const plugins = {
  choropleth: (selection: FeatureSelection, { path }) => selection.join("path").attr("d", path),
  cartogram: (selection: FeatureSelection, { path }) =>
    selection.join(
      (enter) =>
        enter.append("circle").call(moveToCentroid, { path }).attr("r", 5).attr("stroke", "#fff"),
      (update) => update.call(moveToCentroid, { path })
    ),
  centroid: (selection: FeatureSelection, { path }) =>
    selection.join("g").call(moveToCentroid, { path }),
};

function moveToCentroid(selection: FeatureSelection, { path }) {
  selection.each(function (d: Feature) {
    const [x, y] = path.centroid(d);
    if (x && y) select(this).attr("transform", `translate(${x},${y})`);
  });
}

export interface CartogramOptions {
  width?: number;
  height?: number;
  layers: CartogramLayer[];
  projection?: GeoProjection;
}

export interface CartogramLayer {
  type: "choropleth" | "cartogram" | "centroid";
  data: Topology;
  id?: string;
  filter?: (feature: Feature) => boolean;
  update?: (join: FeatureSelection) => void;
  fitSize?: boolean;
  features?: Feature[];
}

export interface Cartogram {
  layers: LayerSelection;
  features: FeatureSelection[];
}

type Feature = GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>;
type LayerSelection = Selection<BaseType | SVGElement, CartogramLayer, SVGElement, unknown>;
type FeatureSelection = Selection<any | SVGCircleElement, Feature, BaseType | SVGElement, unknown>;
