import { LegendOptions, LegendType, LegendPosition } from '../types/legend.model';
import { ScaleType } from '../types/scale-type.enum';

export interface ChartConfig {
  view: [number, number];
  showLegend: boolean;
  legendOptions: LegendOptions;
  legendType: LegendType;
  activeEntries: any[];
  animations: boolean;
}

export function areActiveEntriesEqual(prev: any[], curr: any[]): boolean {
  if (prev === curr) return true;
  if (!prev || !curr) return false;
  if (prev.length !== curr.length) return false;
  if (prev.length === 0 && curr.length === 0) return true;
  return prev.every((v, i) => v === curr[i]);
}

export function getLegendType(legendOptions: LegendOptions): LegendType {
  return legendOptions.scaleType === ScaleType.Linear ? LegendType.ScaleLegend : LegendType.Legend;
}

export function calculateWidths(
  view: [number, number], 
  showLegend: boolean, 
  legendOptions: LegendOptions
): { chartWidth: number; legendWidth: number; legendType: LegendType } {
  let legendColumns = 0;
  let legendType: LegendType;

  if (showLegend) {
    legendType = getLegendType(legendOptions);

    if (!legendOptions || legendOptions.position === LegendPosition.Right) {
      if (legendType === LegendType.ScaleLegend) {
        legendColumns = 1;
      } else {
        legendColumns = 2;
      }
    }
  }

  const chartColumns = 12 - legendColumns;

  const chartWidth = Math.floor((view[0] * chartColumns) / 12.0);
  const legendWidth =
    !legendOptions || legendOptions.position === LegendPosition.Right
      ? Math.floor((view[0] * legendColumns) / 12.0)
      : chartWidth;

  return { chartWidth, legendWidth, legendType };
}
