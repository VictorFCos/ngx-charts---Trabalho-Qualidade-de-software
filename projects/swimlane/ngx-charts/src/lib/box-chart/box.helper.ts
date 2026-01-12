import { IVector2D } from '../models/coordinates.model';
import { roundedRect } from '../common/shape.helper';
import { cloneLineCoordinates } from './box.component';

export function getBoxRadius(roundEdges: boolean, height: number, width: number): number {
  let radius = 0;
  if (roundEdges && height > 5 && width > 5) {
    radius = Math.floor(Math.min(5, height / 2, width / 2));
  }
  return radius;
}

export function getBoxPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  edges: boolean[]
): string {
  return roundedRect(x, y, width, height, Math.min(height, radius), edges);
}

export function getBoxStartingPath(
  width: number,
  lineCoordinates: [IVector2D, IVector2D, IVector2D, IVector2D],
  roundEdges: boolean,
  edges: boolean[]
): string {
  const radius = roundEdges ? 1 : 0;
  const { x, y } = lineCoordinates[2].v1;
  return roundedRect(x - width, y - 1, width, 2, radius, edges);
}

export function getBoxStartingLineCoordinates(
  lineCoordinates: [IVector2D, IVector2D, IVector2D, IVector2D]
): [IVector2D, IVector2D, IVector2D, IVector2D] {
  const coords = cloneLineCoordinates(lineCoordinates);
  coords[1].v1.y =
    coords[1].v2.y =
    coords[3].v1.y =
    coords[3].v2.y =
    coords[0].v1.y =
    coords[0].v2.y =
      coords[2].v1.y;
  return coords;
}
