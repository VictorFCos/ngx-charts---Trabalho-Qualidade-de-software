import { DataItem, StringOrNumberOrDate } from '../../models/chart-data.model';
import { ColorHelper } from '../color.helper';
import { formatLabel } from '../label.helper';
import { trimLabel } from '../trim-label.helper';
import { roundPercentagesWithDecimals } from '../percentage.helper';

export interface AdvancedLegendItem {
  value: StringOrNumberOrDate;
  _value: StringOrNumberOrDate;
  color: string;
  data: DataItem;
  label: string;
  displayLabel: string;
  originalLabel: string;
  percentage: string;
}

export interface AdvancedLegendConfig {
  width: number;
  data: DataItem[];
  colors: ColorHelper;
  label: string;
  animations: boolean;
  roundPercentages: boolean;
  valueFormatting?: (value: StringOrNumberOrDate) => any;
  labelFormatting?: (value: string) => string;
  percentageFormatting?: (value: number) => any;
}

export function getLegendItems(config: AdvancedLegendConfig): { legendItems: AdvancedLegendItem[], total: number, roundedTotal: number } {
  const total = config.data.map(d => Number(d.value)).reduce((sum, d) => sum + d, 0);
  const roundedTotal = total;
  const values = config.data.map(d => Number(d.value));
  const percentages = config.roundPercentages
    ? roundPercentagesWithDecimals(values)
    : values.map(v => (total > 0 ? (v / total) * 100 : 0));
  
  const legendItems = (config.data as any).map((d, index) => {
    const label = formatLabel(d.name);
    const percentage = percentages[index];
    const formattedLabel = typeof config.labelFormatting === 'function' ? config.labelFormatting(label) : label;
    return {
      _value: d.value,
      data: d,
      value: d.value,
      color: config.colors.getColor(label),
      label: formattedLabel,
      displayLabel: trimLabel(formattedLabel, 20),
      origialLabel: d.name,
      percentage: config.percentageFormatting
        ? config.percentageFormatting(parseFloat(percentage.toLocaleString()))
        : percentage.toLocaleString()
    };
  });

  return { legendItems, total, roundedTotal };
}
