import { arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';

import { DataItem } from '../models/chart-data.model';

export interface PieArcConfig {
  fill: string;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
  value: number;
  max: number;
  data: DataItem;
  explodeSlices: boolean;
  gradient: boolean;
  animate: boolean;
  pointerEvents: boolean;
  isActive: boolean;
}

export function calculatePieArcPath(
  innerRadius: number,
  outerRadius: number,
  max: number,
  value: number,
  cornerRadius: number,
  explodeSlices: boolean
): any {
  let actualOuterRadius = outerRadius;
  if (explodeSlices && innerRadius === 0) {
    actualOuterRadius = (outerRadius * value) / max;
  }

  return arc().innerRadius(innerRadius).outerRadius(actualOuterRadius).cornerRadius(cornerRadius);
}

export function animatePieArc(
  element: HTMLElement,
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
  max: number,
  value: number,
  cornerRadius: number,
  explodeSlices: boolean,
  isUpdate: boolean,
  nodeSelection: any
): void {
  const calc = calculatePieArcPath(innerRadius, outerRadius, max, value, cornerRadius, explodeSlices);
  const node = nodeSelection || nodeSelection.selectAll('.arc').data([{ startAngle, endAngle }]);

  if (isUpdate) {
    node
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        (<any>this)._current = (<any>this)._current || d;
        const interpolater = interpolate((<any>this)._current, d);
        (<any>this)._current = interpolater(0);
        return function (t) {
          return calc(interpolater(t));
        };
      });
  } else {
    node
      .attr('d', function (d) {
        (<any>this)._current = (<any>this)._current || d;
        const copyOfD = Object.assign({}, d);
        copyOfD.endAngle = copyOfD.startAngle;
        (<any>this)._current = copyOfD;
        return calc(copyOfD);
      })
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        (<any>this)._current = (<any>this)._current || d;
        const interpolater = interpolate((<any>this)._current, d);
        (<any>this)._current = interpolater(0);
        return function (t) {
          return calc(interpolater(t));
        };
      });
  }
}

export function hasPieArcConfigChanged(prev: PieArcConfig, curr: PieArcConfig): boolean {
  if (!prev || !curr) return true;
  return (
    prev.startAngle !== curr.startAngle ||
    prev.endAngle !== curr.endAngle ||
    prev.innerRadius !== curr.innerRadius ||
    prev.outerRadius !== curr.outerRadius ||
    prev.cornerRadius !== curr.cornerRadius ||
    prev.value !== curr.value ||
    prev.max !== curr.max ||
    prev.explodeSlices !== curr.explodeSlices ||
    prev.gradient !== curr.gradient ||
    prev.animate !== curr.animate ||
    prev.fill !== curr.fill
  );
}