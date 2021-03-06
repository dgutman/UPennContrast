import { IDisplayLayer, IDataset, IDisplaySlice, IContrast } from "./model";
import { scaleLinear } from "d3-scale";
import { color as asColor } from "d3-color";

export function getLayerImages(
  layer: IDisplayLayer,
  ds: IDataset,
  time: number,
  xy: number,
  z: number
) {
  const resolveSlice = (slice: IDisplaySlice, value: number) => {
    switch (slice.type) {
      case "constant":
        return slice.value == null ? 0 : slice.value;
      case "offset":
        return value + (slice.value == null ? 0 : slice.value);
      case "max-merge":
        return value; // TODO
      default:
        return value;
    }
  };

  const xyIndex = ds.xy.length > 1 ? resolveSlice(layer.xy, xy) : 0;
  // invalid slices
  if (xyIndex < 0 || xyIndex >= ds.xy.length) {
    return [];
  }
  const zIndex = ds.z.length > 1 ? resolveSlice(layer.z, z) : 0;
  // invalid slices
  if (zIndex < 0 || zIndex >= ds.z.length) {
    return [];
  }
  const tIndex = ds.time.length > 1 ? resolveSlice(layer.time, time) : 0;
  if (tIndex < 0 || tIndex >= ds.time.length) {
    return [];
  }

  return ds.images(
    ds.z[zIndex],
    ds.time[tIndex][zIndex],
    ds.xy[xyIndex],
    ds.channels[layer.channel]
  );
}

export interface ITileOptions {
  min: number | "auto" | "min" | "max";
  max: number | "auto" | "min" | "max";
  palette: string[]; // palette of hex colors, e.g. #000000
}

function palette(color: string, steps: number) {
  const scale = scaleLinear<string>()
    .domain([0, steps - 1])
    .range(["#000000", color]);
  const palette: string[] = [];
  for (let i = 0; i < steps; i++) {
    palette.push(asColor(scale(i))!.hex());
  }
  return palette;
}

export function toStyle(
  color: string,
  contrast: IContrast,
  hist: ITileHistogram | null
): ITileOptions {
  // unless we add a gamma function, 2 steps are all that are necessary.
  const p = palette(color, 2);
  if (contrast.mode === "absolute") {
    return {
      min: contrast.blackPoint,
      max: contrast.whitePoint,
      palette: p
    };
  }
  if (hist) {
    const scale = scaleLinear()
      .domain([0, 100])
      .rangeRound([hist.min, hist.max]);
    return {
      min: scale(contrast.blackPoint),
      max: scale(contrast.whitePoint),
      palette: p
    };
  }
  // cannot compute absolute values
  return {
    min: "min",
    max: "max",
    palette: p
  };
}

export interface ITileHistogram {
  bin_edges: number[];
  hist: number[];
  max: number;
  min: number;
  samples: number;
}

export function mergeHistograms(histograms: ITileHistogram[]): ITileHistogram {
  if (histograms.length === 0) {
    return {
      hist: [0, 0],
      bin_edges: [0, 0.5],
      min: 0,
      max: 1,
      samples: 0
    };
  }
  if (histograms.length === 1) {
    return histograms[0];
  }

  // TODO
  return histograms[0];
}
