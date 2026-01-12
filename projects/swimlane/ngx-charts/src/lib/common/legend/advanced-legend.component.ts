import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { formatLabel } from '../label.helper';
import { DataItem, StringOrNumberOrDate } from '../../models/chart-data.model';
import { ColorHelper } from '../color.helper';
import { roundPercentagesWithDecimals } from '../percentage.helper';

export interface AdvancedLegendItem { value: StringOrNumberOrDate; _value: StringOrNumberOrDate; color: string; data: DataItem; label: string; displayLabel: string; originalLabel: string; percentage: string; }

@Component({
  selector: 'ngx-charts-advanced-legend',
  template: `
    <div class="advanced-pie-legend" [style.width.px]="width">
      <div *ngIf="animations" class="total-value" ngx-charts-count-up [countTo]="roundedTotal" [valueFormatting]="valueFormatting"></div>
      <div class="total-value" *ngIf="!animations">{{ valueFormatting ? valueFormatting(roundedTotal) : defaultValueFormatting(roundedTotal) }}</div>
      <div class="total-label">{{ label }}</div>
      <div class="legend-items-container"><div class="legend-items">
          <div *ngFor="let legendItem of legendItems; trackBy: trackBy" tabindex="-1" class="legend-item" (mouseenter)="activate.emit(legendItem.data)" (mouseleave)="deactivate.emit(legendItem.data)" (click)="select.emit(legendItem.data)">
            <div class="item-color" [style.border-left-color]="legendItem.color"></div>
            <div *ngIf="animations" class="item-value" ngx-charts-count-up [countTo]="legendItem._value" [valueFormatting]="valueFormatting"></div>
            <div *ngIf="!animations" class="item-value">{{ valueFormatting ? valueFormatting(legendItem.value) : defaultValueFormatting(legendItem.value) }}</div>
            <div class="item-label">{{ legendItem.displayLabel }}</div>
            <div *ngIf="animations" class="item-percent" ngx-charts-count-up [countDecimals]="2" [countTo]="legendItem.percentage" [countSuffix]="'%'"></div>
            <div *ngIf="!animations" class="item-percent">{{ legendItem.percentage.toLocaleString() }}%</div>
          </div>
      </div></div>
    </div>
  `,
  styleUrls: ['./advanced-legend.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AdvancedLegendComponent implements OnChanges {
  @Input() width: number; @Input() data: DataItem[]; @Input() colors: ColorHelper; @Input() label: string = 'Total'; @Input() animations: boolean = true; @Input() roundPercentages: boolean = true;
  @Output() select = new EventEmitter(); @Output() activate = new EventEmitter(); @Output() deactivate = new EventEmitter();
  legendItems: AdvancedLegendItem[] = []; total: number; roundedTotal: number;
  @Input() valueFormatting: (value: StringOrNumberOrDate) => any;
  @Input() labelFormatting: (value: string) => string = label => label;
  @Input() percentageFormatting: (value: number) => any = percentage => percentage;
  defaultValueFormatting: (value: StringOrNumberOrDate) => string = value => value.toLocaleString();

  ngOnChanges(changes: SimpleChanges): void { this.update(); }
  update(): void {
    this.total = this.data.map(d => Number(d.value)).reduce((sum, d) => sum + d, 0);
    this.roundedTotal = this.total;
    const values = this.data.map(d => Number(d.value));
    const percentages = this.roundPercentages ? roundPercentagesWithDecimals(values) : values.map(v => (this.total > 0 ? (v / this.total) * 100 : 0));
    this.legendItems = (this.data as any).map((d, index) => {
      const label = formatLabel(d.name);
      const percentage = percentages[index];
      const formattedLabel = typeof this.labelFormatting === 'function' ? this.labelFormatting(label) : label;
      return {
        _value: d.value, data: d, value: d.value, color: this.colors.getColor(label), label: formattedLabel,
        displayLabel: trimLabel(formattedLabel, 20), origialLabel: d.name,
        percentage: this.percentageFormatting ? this.percentageFormatting(parseFloat(percentage.toLocaleString())) : percentage.toLocaleString()
      };
    });
  }
  trackBy(index: number, item: AdvancedLegendItem) { return item.label; }
}