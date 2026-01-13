import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { StringOrNumberOrDate } from '../../models/chart-data.model';
import { AdvancedLegendConfig, AdvancedLegendItem, getLegendItems } from './advanced-legend.helper';

@Component({
  selector: 'ngx-charts-advanced-legend',
  templateUrl: './advanced-legend.component.html',
  styleUrls: ['./advanced-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AdvancedLegendComponent implements OnChanges {
  @Input() config: AdvancedLegendConfig;
  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();

  legendItems: AdvancedLegendItem[] = [];
  total: number;
  roundedTotal: number;
  
  defaultValueFormatting: (value: StringOrNumberOrDate) => string = value => value.toLocaleString();

  // Getters for template compatibility
  get width() { return this.config?.width; }
  get label() { return this.config?.label; }
  get animations() { return this.config?.animations; }
  get valueFormatting() { return this.config?.valueFormatting; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      this.update();
    }
  }

  update(): void {
    const result = getLegendItems(this.config);
    this.legendItems = result.legendItems;
    this.total = result.total;
    this.roundedTotal = result.roundedTotal;
  }

  trackBy(index: number, item: AdvancedLegendItem) {
    return item.label;
  }
}