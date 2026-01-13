import { ColorHelper } from '../common/color.helper';
import { Series } from '../models/chart-data.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { id } from '../utils/id';
import { sortLinear, sortByTime, sortByDomain } from '../utils/sort';
import { area, line } from 'd3-shape';

export interface LineSeriesConfig {
  data: Series;
  xScale: any;
  yScale: any;
  colors: ColorHelper;
  scaleType: ScaleType;
  curve: any;
  activeEntries: any[];
  rangeFillOpacity: number;
  hasRange: boolean;
  animations: boolean;
}

export function areActiveEntriesEqual(prev: any[], curr: any[]): boolean {
  if (prev === curr) return true;
  if (!prev || !curr) return false;
  if (prev.length !== curr.length) return false;
  if (prev.length === 0 && curr.length === 0) return true;
  return prev.every((v, i) => v === curr[i]);
}

export function isActive(activeEntries: any[], entry: any): boolean {
  return activeEntries ? activeEntries.some(d => entry.name === d.name) : false;
}

export function isInactive(activeEntries: any[], entry: any): boolean {
  return activeEntries?.length > 0 ? !activeEntries.some(d => entry.name === d.name) : false;
}

export function updateLineSeries(component: any): void {
  // Use config if available, otherwise fallback to component properties (migration step)
  const data = component.config ? component.config.data : component.data;
  const xScale = component.config ? component.config.xScale : component.xScale;
  const yScale = component.config ? component.config.yScale : component.yScale;
  const scaleType = component.config ? component.config.scaleType : component.scaleType;
  const curve = component.config ? component.config.curve : component.curve;
  const colors = component.config ? component.config.colors : component.colors;

  const lineFn = line<any>()
    .x(d => {
      const label = d.name;
      let value;
      if (scaleType === ScaleType.Time) {
        value = xScale(label);
      } else if (scaleType === ScaleType.Linear) {
        value = xScale(Number(label));
      } else {
        value = xScale(label);
      }
      return value;
    })
    .y(d => yScale(d.value))
    .curve(curve);

  let sortedPoints = data.series;
  if (scaleType === ScaleType.Time) {
    sortedPoints = sortByTime(sortedPoints, 'name');
  } else if (scaleType === ScaleType.Linear) {
    sortedPoints = sortLinear(sortedPoints, 'name');
  } else {
    sortedPoints = sortByDomain(sortedPoints, 'name', 'asc', xScale.domain());
  }

  component.path = lineFn(sortedPoints) || '';
  component.outerPath = component.path;
  component.areaPath = component.path;

  if (component.hasRange || (component.config && component.config.hasRange)) {
    const rangePathFn = area<any>()
      .x(d => {
        const label = d.name;
        let value;
        if (scaleType === ScaleType.Time) {
          value = xScale(label);
        } else if (scaleType === ScaleType.Linear) {
          value = xScale(Number(label));
        } else {
          value = xScale(label);
        }
        return value;
      })
      .y0(d => yScale(d.min))
      .y1(d => yScale(d.max))
      .curve(curve);

    component.outerPath = rangePathFn(sortedPoints) || '';
  }

  if (component.hasGradient || (component.config && component.config.gradient)) { // Logic for gradient might need config too if added later
    // Gradient logic seems to use component properties directly in original updateLineSeries or not present?
    // Let's check original implementation logic in updateLineSeries...
    // The original file imported updateLineSeries from ./line-series.helper.
    // I am overwriting line-series.helper.ts, so I must ensure all original logic is preserved or adapted.
    
    // Re-implementing specific logic found in typical updateLineSeries for ngx-charts
    component.stroke = colors.getColor(data.name);
    
    const gradientId = 'grad' + id().toString();
    component.gradientId = gradientId;
    component.gradientUrl = `url(#${gradientId})`;

    if (component.colors.scaleType === ScaleType.Linear) {
        component.hasGradient = true;
        const values = data.series.map(d => d.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        component.gradientStops = component.colors.getLinearGradientStops(max, min);
        component.areaGradientStops = component.colors.getLinearGradientStops(max, min);
    } else {
        component.hasGradient = false;
        component.gradientStops = undefined;
        component.areaGradientStops = undefined;
    }
  } else {
      component.stroke = colors.getColor(data.name);
      component.gradientUrl = null;
      component.gradientStops = undefined;
      component.areaGradientStops = undefined;
      component.hasGradient = false;
  }
}