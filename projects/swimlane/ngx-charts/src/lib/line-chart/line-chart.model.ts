
import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';

export interface LineChartOptions {
    legend: boolean;
    legendTitle: string;
    legendPosition: LegendPosition;
    xAxis: boolean;
    yAxis: boolean;
    showXAxisLabel: boolean;
    showYAxisLabel: boolean;
    xAxisLabel: string;
    yAxisLabel: string;
    autoScale: boolean;
    timeline: boolean;
    gradient: boolean;
    showGridLines: boolean;
    curve: any;
    activeEntries: any[];
    schemeType: ScaleType;
    rangeFillOpacity: number;
    trimXAxisTicks: boolean;
    trimYAxisTicks: boolean;
    rotateXAxisTicks: boolean;
    maxXAxisTickLength: number;
    maxYAxisTickLength: number;
    xAxisTickFormatting: (o: any) => string;
    yAxisTickFormatting: (o: any) => string;
    xAxisTicks: any[];
    yAxisTicks: any[];
    roundDomains: boolean;
    tooltipDisabled: boolean;
    showRefLines: boolean;
    referenceLines: any[];
    showRefLabels: boolean;
    xScaleMin: number;
    xScaleMax: number;
    yScaleMin: number;
    yScaleMax: number;
    wrapTicks: boolean;
}
