import { scaleLinear } from 'd3-scale';

export function getGaugeValueDomain(results: any[], min: number, max: number): [number, number] {
  const values = results.map(d => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const actualMin = min !== undefined ? Math.min(min, dataMin) : dataMin;
  const actualMax = max !== undefined ? Math.max(max, dataMax) : dataMax;
  return [actualMin, actualMax];
}

export function getGaugeDisplayValue(results: any[], textValue: string, valueFormatting: any): string {
  const value = results.map(d => d.value).reduce((a, b) => a + b, 0);
  if (textValue && 0 !== textValue.length) return textValue.toLocaleString();
  if (valueFormatting) return valueFormatting(value);
  return value.toLocaleString();
}

export function getGaugeArcs(results: any[], outerRadius: number, angleSpan: number, valueScale: any, max: number): any[] {
  const arcs = [];
  const availableRadius = outerRadius * 0.7;
  const radiusPerArc = Math.min(availableRadius / results.length, 10);
  const arcWidth = radiusPerArc * 0.7;

  let i = 0;
  for (const d of results) {
    const r = outerRadius - i * radiusPerArc;
    arcs.push({
      backgroundArc: {
        endAngle: (angleSpan * Math.PI) / 180,
        innerRadius: r - arcWidth,
        outerRadius: r,
        data: { value: max, name: d.name }
      },
      valueArc: {
        endAngle: (Math.min(valueScale(d.value), angleSpan) * Math.PI) / 180,
        innerRadius: r - arcWidth,
        outerRadius: r,
        data: { value: d.value, name: d.name }
      }
    });
    i++;
  }
  return arcs;
}
