import { area } from 'd3-shape';
import { ScaleType } from '../common/types/scale-type.enum';
import { sortLinear, sortByTime, sortByDomain } from '../utils/sort';
import { Gradient } from '../common/types/gradient.interface';

export function getAreaGenerators(
  xScale: any,
  yScale: any,
  curve: any,
  stacked: boolean,
  normalized: boolean,
  baseValue: any
): { currentArea: any, startingArea: any } {
  const xProperty = d => xScale(d.name);
  let currentArea;
  let startingArea;

  if (stacked || normalized) {
    currentArea = area<any>()
      .x(xProperty)
      .y0(d => yScale(d.d0))
      .y1(d => yScale(d.d1));

    startingArea = area<any>()
      .x(xProperty)
      .y0(() => yScale.range()[0])
      .y1(() => yScale.range()[0]);
  } else {
    currentArea = area<any>()
      .x(xProperty)
      .y0(() => (baseValue === 'auto' ? yScale.range()[0] : yScale(baseValue)))
      .y1(d => yScale(d.value));

    startingArea = area<any>()
      .x(xProperty)
      .y0(() => (baseValue === 'auto' ? yScale.range()[0] : yScale(baseValue)))
      .y1(() => (baseValue === 'auto' ? yScale.range()[0] : yScale(baseValue)));
  }

  currentArea.curve(curve);
  startingArea.curve(curve);

  return { currentArea, startingArea };
}

export function sortAreaSeriesData(data: any[], scaleType: ScaleType, xScale: any) {
  if (scaleType === ScaleType.Linear) {
    return sortLinear(data, 'name');
  } else if (scaleType === ScaleType.Time) {
    return sortByTime(data, 'name');
  } else {
    return sortByDomain(data, 'name', 'asc', xScale.domain());
  }
}

export function getAreaSeriesGradient(
  colors: any,
  stacked: boolean,
  normalized: boolean,
  series: any[]
): { hasGradient: boolean, gradientStops: Gradient[] } {
  if (colors.scaleType === ScaleType.Linear) {
    let max, min;
    if (stacked || normalized) {
      max = Math.max(...series.map(d => d.d1));
      min = Math.min(...series.map(d => d.d0));
      return { hasGradient: true, gradientStops: colors.getLinearGradientStops(max, min) };
    } else {
      max = Math.max(...series.map(d => d.value));
      return { hasGradient: true, gradientStops: colors.getLinearGradientStops(max) };
    }
  }
  return { hasGradient: false, gradientStops: undefined };
}
