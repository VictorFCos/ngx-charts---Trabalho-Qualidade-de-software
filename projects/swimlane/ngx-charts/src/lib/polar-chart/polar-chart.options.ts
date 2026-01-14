import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';

export interface PolarChartOptions {
    legend?: boolean;
    legendTitle?: string;
    legendPosition?: LegendPosition;
    xAxis?: boolean;
    yAxis?: boolean;
    showXAxisLabel?: boolean;
    showYAxisLabel?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    autoScale?: boolean;
    showGridLines?: boolean;
    curve?: unknown;
    activeEntries?: unknown[];
    schemeType?: ScaleType;
    rangeFillOpacity?: number;
    trimYAxisTicks?: boolean;
    maxYAxisTickLength?: number;
    xAxisTickFormatting?: (o: unknown) => string;
    yAxisTickFormatting?: (o: unknown) => string;
    roundDomains?: boolean;
    tooltipDisabled?: boolean;
    showSeriesOnHover?: boolean;
    gradient?: boolean;
    yAxisMinScale?: number;
    labelTrim?: boolean;
    labelTrimSize?: number;
    wrapTicks?: boolean;
}
