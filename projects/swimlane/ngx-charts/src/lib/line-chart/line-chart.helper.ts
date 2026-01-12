import { scaleLinear, scaleTime, scalePoint } from 'd3-scale';
import { ScaleType } from '../common/types/scale-type.enum';
import { getUniqueXDomainValues, getScaleType } from '../common/domain.helper';

export function getLineChartXDomain(
  results: any[],
  xScaleMin: any,
  xScaleMax: any
): { domain: any[]; scaleType: ScaleType; xSet: any[] } {
  let values = getUniqueXDomainValues(results);
  const scaleType = getScaleType(values);
  let domain = [];
  let xSet = [];

  if (scaleType === ScaleType.Linear) values = values.map(v => Number(v));

  const min =
    scaleType === ScaleType.Time || scaleType === ScaleType.Linear
      ? xScaleMin !== undefined
        ? xScaleMin
        : Math.min(...values)
      : null;
  const max =
    scaleType === ScaleType.Time || scaleType === ScaleType.Linear
      ? xScaleMax !== undefined
        ? xScaleMax
        : Math.max(...values)
      : null;

  if (scaleType === ScaleType.Time) {
    domain = [new Date(min), new Date(max)];
    xSet = [...values].sort((a, b) => a.getTime() - b.getTime());
  } else if (scaleType === ScaleType.Linear) {
    domain = [min, max];
    xSet = [...values].sort((a, b) => a - b);
  } else {
    domain = values;
    xSet = values;
  }
  return { domain, scaleType, xSet };
}

export function getLineChartYDomain(
  results: any[],
  autoScale: boolean,
  yScaleMin: number,
  yScaleMax: number
): { domain: [number, number]; hasRange: boolean } {
  const domain = [];
  let hasRange = false;
  for (const group of results) {
    for (const d of group.series) {
      if (!domain.includes(d.value)) domain.push(d.value);
      if (d.min !== undefined) {
        hasRange = true;
        if (!domain.includes(d.min)) domain.push(d.min);
      }
      if (d.max !== undefined) {
        hasRange = true;
        if (!domain.includes(d.max)) domain.push(d.max);
      }
    }
  }
  const values = [...domain];
  if (!autoScale) values.push(0);
  const min = yScaleMin !== undefined ? yScaleMin : Math.min(...values);
  const max = yScaleMax !== undefined ? yScaleMax : Math.max(...values);
  return { domain: [min, max], hasRange };
}

export function getLineChartXScale(domain: any[], width: number, scaleType: ScaleType, roundDomains: boolean): any {
  if (scaleType === ScaleType.Time) return scaleTime().range([0, width]).domain(domain);
  if (scaleType === ScaleType.Linear) {
    const scale = scaleLinear().range([0, width]).domain(domain);
    return roundDomains ? scale.nice() : scale;
  }
  return scalePoint().range([0, width]).padding(0.1).domain(domain);
}
