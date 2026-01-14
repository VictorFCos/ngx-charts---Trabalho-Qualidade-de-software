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

export function isLabelVisible(myArc: any, showLabels: boolean): boolean {
  return showLabels && myArc.endAngle - myArc.startAngle > Math.PI / 30;
}

export function calculateLabelPositions(pieData: any[], outerRadius: number, showLabels: boolean): any[] {
  const factor = 1.5;
  const minDistance = 10;
  const labelPositions = pieData;

  const outerArcGenerator = arc()
    .innerRadius(outerRadius * factor)
    .outerRadius(outerRadius * factor);

  labelPositions.forEach(d => {
    d.pos = outerArcGenerator.centroid(d as any);
    d.pos[0] = factor * outerRadius * (getMidAngle(d) < Math.PI ? 1 : -1);
  });

  for (let i = 0; i < labelPositions.length - 1; i++) {
    const a = labelPositions[i];
    if (!isLabelVisible(a, showLabels)) {
      continue;
    }

    for (let j = i + 1; j < labelPositions.length; j++) {
      const b = labelPositions[j];
      if (!isLabelVisible(b, showLabels)) {
        continue;
      }
      // if they're on the same side
      if (b.pos[0] * a.pos[0] > 0) {
        // if they're overlapping
        const o = minDistance - Math.abs(b.pos[1] - a.pos[1]);
        if (o > 0) {
          // push the second up or down
          b.pos[1] += Math.sign(b.pos[0]) * o;
        }
      }
    }
  }

  return labelPositions;
}