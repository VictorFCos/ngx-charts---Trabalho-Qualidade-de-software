import { timeFormat } from 'd3-time-format';
import { StringOrNumberOrDate } from '../models/chart-data.model';

export function tickFormat(fieldType: string, groupByType: string): (label: StringOrNumberOrDate) => string {
  return function (label: StringOrNumberOrDate): string {
    if (label === 'No Value' || label === 'Other') {
      return label as string;
    }
    if (fieldType === 'date' && groupByType === 'groupBy') {
      const formatter = timeFormat('MM/DD/YYYY');
      return formatter(label as Date);
    }

    return label.toString();
  };
}
