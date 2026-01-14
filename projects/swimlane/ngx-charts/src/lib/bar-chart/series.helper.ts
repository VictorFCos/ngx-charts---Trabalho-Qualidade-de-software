
import { formatLabel, escapeLabel } from '../common/label.helper';
import { DataItem, StringOrNumberOrDate } from '../models/chart-data.model';
import { ColorHelper } from '../common/color.helper';
import { Bar } from './types/bar.model';
import { BarChartType } from './types/bar-chart-type.enum';
import { D0Types } from './types/d0-type.enum';
import { ScaleType } from '../common/types/scale-type.enum';

export interface BarCalcContext {
    series: DataItem[];
    xScale: any;
    yScale: any;
    colors: ColorHelper;
    type: BarChartType;
    roundEdges: boolean;
    tooltipDisabled: boolean;
    seriesName: StringOrNumberOrDate | undefined;
    dataLabelFormatting: any;
    gradient: boolean;
}

export function calculateHorizontalBars(ctx: BarCalcContext): Bar[] {
    const d0 = {
        [D0Types.positive]: 0,
        [D0Types.negative]: 0
    };
    let total: number | undefined;
    if (ctx.type === BarChartType.Normalized) {
        total = ctx.series.map(d => d.value).reduce((sum, d) => (sum as any) + d, 0) as number;
    }
    const xScaleMin = Math.max(ctx.xScale.domain()[0], 0);

    return ctx.series.map(d => {
        let value = d.value as any;
        const label = d.label || d.name;
        const formattedLabel = formatLabel(label);
        const roundEdges = ctx.roundEdges;
        const d0Type = value > 0 ? D0Types.positive : D0Types.negative;

        const bar: any = {
            value,
            label,
            roundEdges,
            data: d,
            formattedLabel
        };

        bar.height = ctx.yScale.bandwidth();

        if (ctx.type === BarChartType.Standard) {
            bar.width = Math.abs(ctx.xScale(value) - ctx.xScale(xScaleMin));
            if (value < 0) {
                bar.x = ctx.xScale(value);
            } else {
                bar.x = ctx.xScale(xScaleMin);
            }
            bar.y = ctx.yScale(label);
        } else if (ctx.type === BarChartType.Stacked) {
            const offset0 = d0[d0Type];
            const offset1 = offset0 + value;
            d0[d0Type] += value;

            bar.width = ctx.xScale(offset1) - ctx.xScale(offset0);
            bar.x = ctx.xScale(offset0);
            bar.y = 0;
            bar.offset0 = offset0;
            bar.offset1 = offset1;
        } else if (ctx.type === BarChartType.Normalized) {
            let offset0 = d0[d0Type];
            let offset1 = offset0 + value;
            d0[d0Type] += value;

            if (total && total > 0) {
                offset0 = (offset0 * 100) / total;
                offset1 = (offset1 * 100) / total;
            } else {
                offset0 = 0;
                offset1 = 0;
            }

            bar.width = ctx.xScale(offset1) - ctx.xScale(offset0);
            bar.x = ctx.xScale(offset0);
            bar.y = 0;
            bar.offset0 = offset0;
            bar.offset1 = offset1;
            value = (offset1 - offset0).toFixed(2) + '%';
        }

        if (ctx.colors.scaleType === ScaleType.Ordinal) {
            bar.color = ctx.colors.getColor(label);
        } else {
            if (ctx.type === BarChartType.Standard) {
                bar.color = ctx.colors.getColor(value);
                bar.gradientStops = ctx.colors.getLinearGradientStops(value);
            } else {
                bar.color = ctx.colors.getColor(bar.offset1);
                bar.gradientStops = ctx.colors.getLinearGradientStops(bar.offset1, bar.offset0);
            }
        }

        let tooltipLabel = formattedLabel;
        bar.ariaLabel = formattedLabel + ' ' + value.toLocaleString();
        if (ctx.seriesName !== null && ctx.seriesName !== undefined) {
            tooltipLabel = `${ctx.seriesName} • ${formattedLabel}`;
            bar.data.series = ctx.seriesName;
            bar.ariaLabel = ctx.seriesName + ' ' + bar.ariaLabel;
        }

        bar.tooltipText = ctx.tooltipDisabled
            ? undefined
            : `
        <span class="tooltip-label">${escapeLabel(tooltipLabel)}</span>
        <span class="tooltip-val">${ctx.dataLabelFormatting ? ctx.dataLabelFormatting(value) : value.toLocaleString()
            }</span>
      `;

        return bar;
    });
}

export function calculateVerticalBars(ctx: BarCalcContext): Bar[] {
    let width: number;
    if (ctx.series.length) {
        width = ctx.xScale.bandwidth();
    }
    width = Math.round(width);
    const yScaleMin = Math.max(ctx.yScale.domain()[0], 0);

    const d0 = {
        [D0Types.positive]: 0,
        [D0Types.negative]: 0
    };
    let total: number | undefined;
    if (ctx.type === BarChartType.Normalized) {
        total = ctx.series.map(d => d.value).reduce((sum, d) => (sum as any) + d, 0) as number;
    }

    return ctx.series.map((d, index) => {
        let value = d.value as any;
        const label = d.label || d.name;
        const formattedLabel = formatLabel(label);
        const roundEdges = ctx.roundEdges;
        const d0Type = value > 0 ? D0Types.positive : D0Types.negative;

        const bar: any = {
            value,
            label,
            roundEdges,
            data: d,
            width,
            formattedLabel,
            height: 0,
            x: 0,
            y: 0
        };

        if (ctx.type === BarChartType.Standard) {
            bar.height = Math.abs(ctx.yScale(value) - ctx.yScale(yScaleMin));
            bar.x = ctx.xScale(label);

            if (value < 0) {
                bar.y = ctx.yScale(0);
            } else {
                bar.y = ctx.yScale(value);
            }
        } else if (ctx.type === BarChartType.Stacked) {
            const offset0 = d0[d0Type];
            const offset1 = offset0 + value;
            d0[d0Type] += value;

            bar.height = ctx.yScale(offset0) - ctx.yScale(offset1);
            bar.x = 0;
            bar.y = ctx.yScale(offset1);
            bar.offset0 = offset0;
            bar.offset1 = offset1;
        } else if (ctx.type === BarChartType.Normalized) {
            let offset0 = d0[d0Type];
            let offset1 = offset0 + value;
            d0[d0Type] += value;

            if (total && total > 0) {
                offset0 = (offset0 * 100) / total;
                offset1 = (offset1 * 100) / total;
            } else {
                offset0 = 0;
                offset1 = 0;
            }

            bar.height = ctx.yScale(offset0) - ctx.yScale(offset1);
            bar.x = 0;
            bar.y = ctx.yScale(offset1);
            bar.offset0 = offset0;
            bar.offset1 = offset1;
            value = (offset1 - offset0).toFixed(2) + '%';
        }

        if (ctx.colors.scaleType === ScaleType.Ordinal) {
            bar.color = ctx.colors.getColor(label);
        } else {
            if (ctx.type === BarChartType.Standard) {
                bar.color = ctx.colors.getColor(value);
                bar.gradientStops = ctx.colors.getLinearGradientStops(value);
            } else {
                bar.color = ctx.colors.getColor(bar.offset1);
                bar.gradientStops = ctx.colors.getLinearGradientStops(bar.offset1, bar.offset0);
            }
        }

        let tooltipLabel = formattedLabel;
        bar.ariaLabel = formattedLabel + ' ' + value.toLocaleString();
        if (ctx.seriesName !== null && ctx.seriesName !== undefined) {
            tooltipLabel = `${ctx.seriesName} • ${formattedLabel}`;
            bar.data.series = ctx.seriesName;
            bar.ariaLabel = ctx.seriesName + ' ' + bar.ariaLabel;
        }

        bar.tooltipText = ctx.tooltipDisabled
            ? undefined
            : `
        <span class="tooltip-label">${escapeLabel(tooltipLabel)}</span>
        <span class="tooltip-val">${ctx.dataLabelFormatting ? ctx.dataLabelFormatting(value) : value.toLocaleString()
            }</span>
      `;

        return bar;
    });
}
