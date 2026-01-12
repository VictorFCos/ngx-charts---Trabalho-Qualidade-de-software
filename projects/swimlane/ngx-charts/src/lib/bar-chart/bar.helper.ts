import { BarOrientation } from '../common/types/bar-orientation.enum';
import { roundedRect } from '../common/shape.helper';
import { Gradient } from '../common/types/gradient.interface';

export function getBarRadius(roundEdges: boolean, height: number, width: number): number {
  let radius = 0;
  if (roundEdges && height > 5 && width > 5) {
    radius = Math.floor(Math.min(5, height / 2, width / 2));
  }
  return radius;
}

export function getBarEdges(roundEdges: boolean, orientation: BarOrientation, value: number): boolean[] {
  let edges = [false, false, false, false];
  if (roundEdges) {
    if (orientation === BarOrientation.Vertical) {
      if (value > 0) {
        edges = [true, true, false, false];
      } else {
        edges = [false, false, true, true];
      }
    } else if (orientation === BarOrientation.Horizontal) {
      if (value > 0) {
        edges = [false, true, false, true];
      } else {
        edges = [true, false, true, false];
      }
    }
  }
  return edges;
}

export function getBarPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  roundEdges: boolean,
  orientation: BarOrientation,
  edges: boolean[]
): string {
  let actualRadius = radius;
  if (roundEdges) {
    if (orientation === BarOrientation.Vertical) {
      actualRadius = Math.min(height, radius);
    } else if (orientation === BarOrientation.Horizontal) {
      actualRadius = Math.min(width, radius);
    }
  }
  return roundedRect(x, y, width, height, actualRadius, edges);
}

export function getBarStartingPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  roundEdges: boolean,
  orientation: BarOrientation,
  edges: boolean[]
): string {
  const actualRadius = roundEdges ? 1 : 0;
  if (orientation === BarOrientation.Vertical) {
    return roundedRect(x, y + height, width, 1, 0, edges);
  } else if (orientation === BarOrientation.Horizontal) {
    return roundedRect(x, y, 1, height, 0, edges);
  }
  return roundedRect(x, y, 1, height, 0, edges);
}

export function getBarGradient(fill: string, stops: Gradient[], startOpacity: number): Gradient[] {
  if (stops) {
    return stops;
  }

  return [
    {
      offset: 0,
      color: fill,
      opacity: startOpacity
    },
    {
      offset: 100,
      color: fill,
      opacity: 1
    }
  ];
}

export function shouldHideBar(
  noBarWhenZero: boolean,
  orientation: BarOrientation,
  width: number,
  height: number
): boolean {
  return (
    noBarWhenZero &&
    ((orientation === BarOrientation.Vertical && height === 0) ||
      (orientation === BarOrientation.Horizontal && width === 0))
  );
}
