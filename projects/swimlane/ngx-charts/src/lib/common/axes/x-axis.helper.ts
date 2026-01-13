import { Orientation } from '../types/orientation.enum';
import { TextAnchor } from '../types/text-anchor.enum';
import { getTickLines, reduceTicks } from './ticks.helper';
import { roundedRect } from '../../common/shape.helper';

export interface XAxisTicksConfig {
  scale: any;
  orient: Orientation;
  tickArguments: number[];
  tickValues: any[];
  tickStroke: string;
  trimTicks: boolean;
  maxTickLength: number;
  tickFormatting: any;
  showGridLines: boolean;
  gridLineHeight: number;
  width: number;
  rotateTicks: boolean;
  wrapTicks: boolean;
  referenceLines: any[];
  showRefLabels: boolean;
  showRefLines: boolean;
}

export function getXAxisRotationAngle(
  ticks: any[],
  tickFormat: (o: any) => string,
  trimTicks: boolean,
  tickTrim: (label: string) => string,
  width: number,
  maxAllowedLength: number
): number {
  let angle = 0;
  let maxTicksLength = 0;
  for (let i = 0; i < ticks.length; i++) {
    const tick = tickFormat(ticks[i]).toString();
    let tickLength = tick.length;
    if (trimTicks) {
      tickLength = tickTrim(tick).length;
    }

    if (tickLength > maxTicksLength) {
      maxTicksLength = tickLength;
    }
  }

  const len = Math.min(maxTicksLength, maxAllowedLength);
  const charWidth = 7;
  const wordWidth = len * charWidth;

  let baseWidth = wordWidth;
  const maxBaseWidth = Math.floor(width / ticks.length);

  while (baseWidth > maxBaseWidth && angle > -90) {
    angle -= 30;
    baseWidth = Math.cos(angle * (Math.PI / 180)) * wordWidth;
  }
  return angle;
}

export function getXAxisTicks(scale: any, tickValues: any[], width: number): any[] {
  let ticks;
  const maxTicks = Math.floor(width / 20);
  const maxScaleTicks = Math.floor(width / 100);

  if (tickValues) {
    ticks = tickValues;
  } else if (scale.ticks) {
    ticks = scale.ticks.apply(scale, [maxScaleTicks]);
  } else {
    ticks = scale.domain();
    ticks = reduceTicks(ticks, maxTicks);
  }

  return ticks;
}

export function getXAxisTickChunks(
  label: string,
  maxTickLength: number,
  bandwidth: number,
  rotateTicks: boolean,
  step: number,
  tickTrim: (label: string) => string,
  maxPossibleLengthForTickIfWrapped: number,
  isPlatformBrowser: boolean,
  approxHeight: number
): string[] {
  if (label.toString().length > maxTickLength && bandwidth) {
    const maxAllowedLines = 5;
    let maxLines = rotateTicks ? Math.floor(step / 14) : maxAllowedLines;

    if (maxLines <= 1) {
      return [tickTrim(label)];
    }

    let possibleStringLength = Math.max(maxPossibleLengthForTickIfWrapped, maxTickLength);

    if (!isPlatformBrowser) {
      possibleStringLength = Math.floor(
        Math.min(approxHeight / maxAllowedLines, Math.max(maxPossibleLengthForTickIfWrapped, maxTickLength))
      );
    }

    maxLines = Math.min(maxLines, maxAllowedLines);
    return getTickLines(label, possibleStringLength, maxLines < 1 ? 1 : maxLines);
  }

  return [tickTrim(label)];
}

export function setXAxisReferenceLines(referenceLines: any[], adjustedScale: any, gridLineHeight: number): any {
  const refMin = adjustedScale(
    Math.min.apply(
      null,
      referenceLines.map(item => item.value)
    )
  );
  const refMax = adjustedScale(
    Math.max.apply(
      null,
      referenceLines.map(item => item.value)
    )
  );
  const referenceLineLength = referenceLines.length;
  const referenceAreaPath = roundedRect(refMax, -gridLineHeight + 25, refMin - refMax, gridLineHeight, 0, [
    false,
    false,
    false,
    false
  ]);
  return { refMin, refMax, referenceLineLength, referenceAreaPath };
}

export function getXAxisHeight(ticksElement: any): number {
  return parseInt(ticksElement.nativeElement.getBoundingClientRect().height, 10);
}

export function updateXAxisTicks(component: any): void {
  // Use config if available
  const scale = component.config ? component.config.scale : component.scale;
  const width = component.config ? component.config.width : component.width;
  const tickValues = component.config ? component.config.tickValues : component.tickValues;
  const tickFormatting = component.config ? component.config.tickFormatting : component.tickFormatting;
  const tickArguments = component.config ? component.config.tickArguments : component.tickArguments;
  const rotateTicks = component.config ? component.config.rotateTicks : component.rotateTicks;
  const trimTicks = component.config ? component.config.trimTicks : component.trimTicks;
  const maxTickLength = component.config ? component.config.maxTickLength : component.maxTickLength;
  const showRefLines = component.config ? component.config.showRefLines : component.showRefLines;
  const referenceLines = component.config ? component.config.referenceLines : component.referenceLines;
  const gridLineHeight = component.config ? component.config.gridLineHeight : component.gridLineHeight;

  component.adjustedScale = scale.bandwidth ? d => scale(d) + scale.bandwidth() * 0.5 : scale;
  component.ticks = getXAxisTicks(scale, tickValues, width);
  component.tickSpacing = Math.max(component.innerTickSize, 0) + component.tickPadding;
  component.tickFormat =
    tickFormatting ||
    (scale.tickFormat
      ? scale.tickFormat(...(tickArguments || []))
      : d => (d.constructor.name === 'Date' ? d.toLocaleDateString() : d.toLocaleString()));
  const angle = rotateTicks
    ? getXAxisRotationAngle(
        component.ticks,
        component.tickFormat,
        trimTicks,
        component.tickTrim.bind(component),
        width,
        component.maxAllowedLength
      )
    : null;
  component.textTransform = angle && angle !== 0 ? `rotate(${angle})` : '';
  component.textAnchor = angle && angle !== 0 ? TextAnchor.End : TextAnchor.Middle;
  if (angle && angle !== 0) component.verticalSpacing = 10;
  if (component.isWrapTicksSupported) {
    const longestTick = component.ticks.reduce(
      (earlier, current) => (current.length > earlier.length ? current : earlier),
      ''
    );
    const tickLines = component.tickChunks(longestTick);
    const labelHeight = 14 * (tickLines.length || 1);
    component.maxPossibleLengthForTickIfWrapped = scale.bandwidth
      ? Math.max(Math.floor(scale.bandwidth() / 7), maxTickLength)
      : maxTickLength;
    component.approxHeight = Math.min(
      angle !== 0
        ? Math.max(Math.abs(Math.sin((angle * Math.PI) / 180)) * maxTickLength * 7, 10)
        : labelHeight,
      200
    );
  }
  if (showRefLines && referenceLines) {
    const { refMin, refMax, referenceLineLength, referenceAreaPath } = setXAxisReferenceLines(
      referenceLines,
      component.adjustedScale,
      gridLineHeight
    );
    component.refMin = refMin;
    component.refMax = refMax;
    component.referenceLineLength = referenceLineLength;
    component.referenceAreaPath = referenceAreaPath;
  }
}