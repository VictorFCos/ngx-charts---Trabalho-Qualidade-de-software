import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';

export interface BarHorizontalNormalizedOptions {
    legend?: boolean;
    legendTitle?: string;
    legendPosition?: LegendPosition;
    xAxis?: boolean;
    yAxis?: boolean;
    showXAxisLabel?: boolean;
    showYAxisLabel?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    tooltipDisabled?: boolean;
    gradient?: boolean;
    showGridLines?: boolean;
    activeEntries?: unknown[];
    schemeType?: ScaleType;
    trimXAxisTicks?: boolean;
    trimYAxisTicks?: boolean;
    rotateXAxisTicks?: boolean;
    maxXAxisTickLength?: number;
    maxYAxisTickLength?: number;
    xAxisTickFormatting?: (val: unknown) => string;
    yAxisTickFormatting?: (val: unknown) => string;
    xAxisTicks?: unknown[];
    yAxisTicks?: unknown[];
    barPadding?: number;
    roundDomains?: boolean;
    noBarWhenZero?: boolean;
    wrapTicks?: boolean;
}
