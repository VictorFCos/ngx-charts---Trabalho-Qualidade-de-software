import { DefaultArcObject, arc } from 'd3-shape';
import { DataItem } from '../models/chart-data.model';
import { TextAnchor } from '../common/types/text-anchor.enum';

export interface PieData extends DefaultArcObject {
  data: DataItem;
  index: number;
  pos: [number, number];
  value: number;
}

export interface PieLabelConfig {
  data: PieData;
  radius: number;
  label: string;
  color: string;
  max: number;
  value: number;
  explodeSlices: boolean;
  animations: boolean;
  labelTrim: boolean;
  labelTrimSize: number;
}

export function calculateLine(
  data: PieData,
  radius: number,
  max: number,
  value: number,
  explodeSlices: boolean
): string {
  let startRadius = radius;
  if (explodeSlices) {
    startRadius = (radius * value) / max;
  }

  const innerArc = arc().innerRadius(startRadius).outerRadius(startRadius);

  // Calculate innerPos then scale outer position to match label position
  const innerPos = innerArc.centroid(data as any);

  let scale = data.pos[1] / innerPos[1];
  if (data.pos[1] === 0 || innerPos[1] === 0) {
    scale = 1;
  }
  const outerPos = [scale * innerPos[0], scale * innerPos[1]];

  return `M${innerPos}L${outerPos}L${data.pos}`;
}

export function getMidAngle(d: any): number {
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

export function getTextAnchor(data: any): TextAnchor {
  return getMidAngle(data) < Math.PI ? TextAnchor.Start : TextAnchor.End;
}

export function hasPieLabelConfigChanged(prev: PieLabelConfig, curr: PieLabelConfig): boolean {
  if (!prev || !curr) return true;
  return (
    prev.data !== curr.data ||
    prev.radius !== curr.radius ||
    prev.label !== curr.label ||
    prev.color !== curr.color ||
    prev.max !== curr.max ||
    prev.value !== curr.value ||
    prev.explodeSlices !== curr.explodeSlices ||
    prev.animations !== curr.animations ||
    prev.labelTrim !== curr.labelTrim ||
    prev.labelTrimSize !== curr.labelTrimSize
  );
}