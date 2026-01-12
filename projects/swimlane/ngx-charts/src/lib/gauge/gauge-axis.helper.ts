import { line } from 'd3-shape';
import { TextAnchor } from '../common/types/text-anchor.enum';

export function getGaugeTickAnchor(angle: number, startAngle: number): TextAnchor {
  const actualAngle = (startAngle + angle) % 360;
  let textAnchor = TextAnchor.Middle;
  if (actualAngle > 45 && actualAngle <= 135) {
    textAnchor = TextAnchor.Start;
  } else if (actualAngle > 225 && actualAngle <= 315) {
    textAnchor = TextAnchor.End;
  }
  return textAnchor;
}

export function getGaugeTickPath(startDistance: number, tickLength: number, angle: number): any {
  const y1 = startDistance * Math.sin(angle);
  const y2 = (startDistance + tickLength) * Math.sin(angle);
  const x1 = startDistance * Math.cos(angle);
  const x2 = (startDistance + tickLength) * Math.cos(angle);

  const points = [
    { x: x1, y: y1 },
    { x: x2, y: y2 }
  ];
  const lineGenerator = line<any>()
    .x(d => d.x)
    .y(d => d.y);
  return lineGenerator(points);
}
