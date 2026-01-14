
import { formatLabel, escapeLabel } from '../common/label.helper';

export function getTooltipText(circle: any, xAxisLabel: string, yAxisLabel: string): string {
    const hasRadius = typeof circle.r !== 'undefined';
    const hasTooltipLabel = circle.tooltipLabel && circle.tooltipLabel.length;
    const hasSeriesName = circle.seriesName && circle.seriesName.length;

    const radiusValue = hasRadius ? formatLabel(circle.r) : '';
    const xLabel = xAxisLabel && xAxisLabel !== '' ? `${xAxisLabel}:` : '';
    const yLabel = yAxisLabel && yAxisLabel !== '' ? `${yAxisLabel}:` : '';
    const x = formatLabel(circle.x);
    const y = formatLabel(circle.y);
    const name =
        hasSeriesName && hasTooltipLabel
            ? `${circle.seriesName} • ${circle.tooltipLabel}`
            : circle.seriesName + circle.tooltipLabel;
    const tooltipTitle =
        hasSeriesName || hasTooltipLabel ? `<span class="tooltip-label">${escapeLabel(name)}</span>` : '';

    return `
      ${tooltipTitle}
      <span class="tooltip-label">
        <label>${escapeLabel(xLabel)}</label> ${escapeLabel(x)}<br />
        <label>${escapeLabel(yLabel)}</label> ${escapeLabel(y)}
      </span>
      <span class="tooltip-val">
        ${escapeLabel(radiusValue)}
      </span>
    `;
}
