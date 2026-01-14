
import { ScaleType } from '../common/types/scale-type.enum';
import { LegendPosition } from '../common/types/legend.model';

export interface BarChartConfig {
    legend: boolean;
    legendTitle: string;
    legendPosition: LegendPosition;
    xAxis: boolean;
    yAxis: boolean;
    showXAxisLabel: boolean;
    showYAxisLabel: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
    tooltipDisabled: boolean;
    gradient: boolean;
    showGridLines: boolean;
    activeEntries: unknown[];
    schemeType: ScaleType;
    trimXAxisTicks: boolean;
    trimYAxisTicks: boolean;
    rotateXAxisTicks: boolean;
    maxXAxisTickLength: number;
    maxYAxisTickLength: number;
    xAxisTickFormatting: (val: unknown) => string;
    yAxisTickFormatting: (val: unknown) => string;
    xAxisTicks: unknown[];
    yAxisTicks: unknown[];
    barPadding: number;
    roundDomains: boolean;
    roundEdges: boolean;
    showDataLabel: boolean;
    dataLabelFormatting: (val: unknown) => string;
    noBarWhenZero: boolean;
    wrapTicks: boolean;
    referenceLines?: unknown[];
    showRefLines?: boolean;
    showRefLabels?: boolean;
}

export interface BarVerticalChartOptions extends BarChartConfig {
    yScaleMax: number;
    yScaleMin: number;
}

export interface BarHorizontalChartOptions extends BarChartConfig {
    xScaleMax: number;
    xScaleMin: number;
}
