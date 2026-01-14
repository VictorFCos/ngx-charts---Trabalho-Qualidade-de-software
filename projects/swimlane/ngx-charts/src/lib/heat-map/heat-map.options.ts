import { LegendPosition } from '../common/types/legend.model';

export interface HeatMapOptions {
    legend?: boolean;
    legendTitle?: string;
    legendPosition?: LegendPosition;
    xAxis?: boolean;
    yAxis?: boolean;
    showXAxisLabel?: boolean;
    showYAxisLabel?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    gradient?: boolean;
    innerPadding?: number | number[] | string | string[];
    trimXAxisTicks?: boolean;
    trimYAxisTicks?: boolean;
    rotateXAxisTicks?: boolean;
    maxXAxisTickLength?: number;
    maxYAxisTickLength?: number;
    xAxisTickFormatting?: (o: unknown) => string;
    yAxisTickFormatting?: (o: unknown) => string;
    xAxisTicks?: unknown[];
    yAxisTicks?: unknown[];
    tooltipDisabled?: boolean;
    tooltipText?: (o: unknown) => string;
    min?: number;
    max?: number;
    activeEntries?: unknown[];
    wrapTicks?: boolean;
}
