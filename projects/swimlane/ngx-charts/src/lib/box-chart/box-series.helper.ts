import { TemplateRef } from '@angular/core';
import { min, max, quantile } from 'd3-array';
import { ScaleLinear, ScaleBand } from 'd3-scale';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ColorHelper } from '../common/color.helper';
import { StyleTypes } from '../common/tooltip/style.type';
import { PlacementTypes } from '../common/tooltip/position';
import { IVector2D } from '../models/coordinates.model';
import { IBoxModel, BoxChartSeries, DataItem } from '../models/chart-data.model';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { ScaleType } from '../common/types/scale-type.enum';

export interface BoxSeriesConfig {
  dims: ViewDimensions;
  xScale: ScaleBand<string>;
  yScale: ScaleLinear<number, number>;
  colors: ColorHelper;
  animations: boolean;
  strokeColor: string;
  strokeWidth: number;
  tooltipDisabled: boolean;
  tooltipTemplate: TemplateRef<any>;
  tooltipPlacement: PlacementTypes;
  tooltipType: StyleTypes;
  roundEdges: boolean;
  gradient: boolean;
}

export function getBoxQuantiles(inputData: Array<number | Date>): [number, number, number] {
  return [quantile(inputData, 0.25), quantile(inputData, 0.5), quantile(inputData, 0.75)];
}

export function getLinesCoordinates(
  seriesName: string,
  whiskers: [number, number],
  quartiles: [number, number, number],
  barWidth: number,
  xScale: ScaleBand<string>,
  yScale: ScaleLinear<number, number>,
  strokeWidth: number
): [IVector2D, IVector2D, IVector2D, IVector2D] {
  // The X value is not being centered, so had to sum half the width to align it.
  const commonX = xScale(seriesName);
  const offsetX = commonX + barWidth / 2;

  const medianLineWidth = Math.max(barWidth + 4 * strokeWidth, 1);
  const whiskerLineWidth = Math.max(barWidth / 3, 1);

  const whiskerZero = yScale(whiskers[0]);
  const whiskerOne = yScale(whiskers[1]);
  const median = yScale(quartiles[1]);

  const topLine: IVector2D = {
    v1: { x: offsetX + whiskerLineWidth / 2, y: whiskerZero },
    v2: { x: offsetX - whiskerLineWidth / 2, y: whiskerZero }
  };
  const medianLine: IVector2D = {
    v1: { x: offsetX + medianLineWidth / 2, y: median },
    v2: { x: offsetX - medianLineWidth / 2, y: median }
  };
  const bottomLine: IVector2D = {
    v1: { x: offsetX + whiskerLineWidth / 2, y: whiskerOne },
    v2: { x: offsetX - whiskerLineWidth / 2, y: whiskerOne }
  };
  const verticalLine: IVector2D = {
    v1: { x: offsetX, y: whiskerZero },
    v2: { x: offsetX, y: whiskerOne }
  };
  return [verticalLine, topLine, medianLine, bottomLine];
}

export function getBoxModel(
  series: BoxChartSeries,
  config: BoxSeriesConfig
): { box: IBoxModel; tooltipTitle: string } {
  const width = series && series.series.length ? Math.round(config.xScale.bandwidth()) : null;
  const seriesName = series.name;

  // Calculate Quantile and Whiskers for each box serie.
  const counts = series.series;

  const mappedCounts = counts.map(serie => Number(serie.value));
  const whiskers: [number, number] = [min(mappedCounts), max(mappedCounts)];

  // We get the group count and must sort it in order to retrieve quantiles.
  const groupCounts = counts.map(item => item.value).sort((a, b) => Number(a) - Number(b));
  const quartiles = getBoxQuantiles(groupCounts);
  const lineCoordinates = getLinesCoordinates(
    seriesName.toString(),
    whiskers,
    quartiles,
    width,
    config.xScale,
    config.yScale,
    config.strokeWidth
  );

  const value = quartiles[1];
  const formattedLabel = formatLabel(seriesName);
  const box: IBoxModel = {
    value,
    data: counts,
    label: seriesName,
    formattedLabel,
    width,
    height: 0,
    x: 0,
    y: 0,
    roundEdges: config.roundEdges,
    quartiles: quartiles,
    lineCoordinates: lineCoordinates
  };

  box.height = Math.abs(config.yScale(quartiles[0]) - config.yScale(quartiles[2]));
  box.x = config.xScale(seriesName.toString());
  box.y = config.yScale(quartiles[2]);
  box.ariaLabel = formattedLabel + ' - Median: ' + value.toLocaleString();

  if (config.colors.scaleType === ScaleType.Ordinal) {
    box.color = config.colors.getColor(seriesName);
  } else {
    box.color = config.colors.getColor(quartiles[1]);
    box.gradientStops = config.colors.getLinearGradientStops(quartiles[0], quartiles[2]);
  }

  const tooltipLabel = formattedLabel;
  const formattedTooltipLabel = `
  <span class="tooltip-label">${escapeLabel(tooltipLabel)}</span>
  <span class="tooltip-val">
    • Q1: ${quartiles[0]} • Q2: ${quartiles[1]} • Q3: ${quartiles[2]}<br>
    • Min: ${whiskers[0]} • Max: ${whiskers[1]}
  </span>`;

  box.tooltipText = config.tooltipDisabled ? undefined : formattedTooltipLabel;
  const tooltipTitle = config.tooltipDisabled ? undefined : box.tooltipText;

  return { box, tooltipTitle };
}