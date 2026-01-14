import { Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy, TemplateRef, SimpleChanges } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { formatLabel, escapeLabel } from '../common/label.helper';
import { DataItem, StringOrNumberOrDate } from '../models/chart-data.model';
import { ColorHelper } from '../common/color.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
import { BarChartType } from './types/bar-chart-type.enum';
import { Bar } from './types/bar.model';
import { D0Types } from './types/d0-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { ScaleType } from '../common/types/scale-type.enum';
import { calculateHorizontalBars } from './series.helper';

@Component({
  selector: 'g[ngx-charts-series-horizontal]',
  template: `
    <svg:g
      ngx-charts-bar
      *ngFor="let bar of bars; trackBy: trackBy"
      [@animationState]="'active'"
      [width]="bar.width"
      [height]="bar.height"
      [x]="bar.x"
      [y]="bar.y"
      [fill]="bar.color"
      [stops]="bar.gradientStops"
      [data]="bar.data"
      [orientation]="barOrientation.Horizontal"
      [roundEdges]="bar.roundEdges"
      (select)="click($event)"
      [gradient]="gradient"
      [isActive]="isActive(bar.data)"
      [ariaLabel]="bar.ariaLabel"
      [animations]="animations"
      (activate)="activate.emit($event)"
      (deactivate)="deactivate.emit($event)"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="tooltipPlacement"
      [tooltipType]="tooltipType"
      [tooltipTitle]="tooltipTemplate ? undefined : bar.tooltipText"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="bar.data"
      [noBarWhenZero]="noBarWhenZero"
    ></svg:g>
    <svg:g *ngIf="showDataLabel">
      <svg:g
        ngx-charts-bar-label
        *ngFor="let b of barsForDataLabels; let i = index; trackBy: trackDataLabelBy"
        [barX]="b.x"
        [barY]="b.y"
        [barWidth]="b.width"
        [barHeight]="b.height"
        [value]="b.total"
        [valueFormatting]="dataLabelFormatting"
        [orientation]="barOrientation.Horizontal"
        (dimensionsChanged)="dataLabelWidthChanged.emit({ size: $event, index: i })"
      />
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ],
  standalone: false
})
export class SeriesHorizontal implements OnChanges {
  @Input() dims: ViewDimensions;
  @Input() type: BarChartType = BarChartType.Standard;
  @Input() series: DataItem[];
  @Input() xScale;
  @Input() yScale;
  @Input() colors: ColorHelper;
  @Input() tooltipDisabled: boolean = false;
  @Input() gradient: boolean;
  @Input() activeEntries: DataItem[];
  @Input() seriesName: StringOrNumberOrDate;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() roundEdges: boolean;
  @Input() animations: boolean = true;
  @Input() showDataLabel: boolean = false;
  @Input() dataLabelFormatting: any;
  @Input() noBarWhenZero: boolean = true;

  @Output() select: EventEmitter<DataItem> = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @Output() dataLabelWidthChanged = new EventEmitter<{ size: Event; index: number }>();

  tooltipPlacement: PlacementTypes;
  tooltipType: StyleTypes;
  bars: Bar[];
  barsForDataLabels: Array<{ x: number; y: number; width: number; height: number; total: number; series: string }> = [];

  barOrientation = BarOrientation;

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    for (const propName in changes) {
      if (propName === 'activeEntries') {
        const current = changes[propName].currentValue;
        const previous = changes[propName].previousValue;
        if (!this.areActiveEntriesEqual(previous, current)) {
          shouldUpdate = true;
        }
      } else {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      this.update();
    }
  }

  areActiveEntriesEqual(prev: any[], curr: any[]): boolean {
    if (prev === curr) return true;
    if (!prev || !curr) return false;
    if (prev.length !== curr.length) return false;
    if (prev.length === 0 && curr.length === 0) return true;
    return prev.every((v, i) => v === curr[i]);
  }

  update(): void {
    this.updateTooltipSettings();
    this.bars = calculateHorizontalBars({
      series: this.series,
      xScale: this.xScale,
      yScale: this.yScale,
      colors: this.colors,
      type: this.type,
      roundEdges: this.roundEdges,
      tooltipDisabled: this.tooltipDisabled,
      seriesName: this.seriesName,
      dataLabelFormatting: this.dataLabelFormatting,
      gradient: this.gradient
    });
    this.updateDataLabels();
  }

  updateDataLabels(): void {
    if (this.type === BarChartType.Stacked) {
      this.barsForDataLabels = [];
      const section: any = {};
      section.series = this.seriesName;
      const totalPositive = this.series.map(d => d.value).reduce((sum, d) => (d > 0 ? sum + d : sum), 0);
      const totalNegative = this.series.map(d => d.value).reduce((sum, d) => (d < 0 ? sum + d : sum), 0);
      section.total = totalPositive + totalNegative;
      section.x = 0;
      section.y = 0;
      // if total is positive then we show it on the right, otherwise on the left
      if (section.total > 0) {
        section.width = this.xScale(totalPositive);
      } else {
        section.width = this.xScale(totalNegative);
      }
      section.height = this.yScale.bandwidth();
      this.barsForDataLabels.push(section);
    } else {
      this.barsForDataLabels = this.series.map(d => {
        const section: any = {};
        section.series = this.seriesName ?? d.label;
        section.total = d.value;
        section.x = this.xScale(0);
        section.y = this.yScale(d.label);
        section.width = this.xScale(section.total) - this.xScale(0);
        section.height = this.yScale.bandwidth();
        return section;
      });
    }
  }

  updateTooltipSettings(): void {
    this.tooltipPlacement = this.tooltipDisabled ? undefined : PlacementTypes.Top;
    this.tooltipType = this.tooltipDisabled ? undefined : StyleTypes.tooltip;
  }

  isActive(entry: DataItem): boolean {
    if (!this.activeEntries) return false;

    const item = this.activeEntries.find(active => {
      return entry.name === active.name && entry.value === active.value;
    });

    return item !== undefined;
  }

  getLabel(dataItem: DataItem): StringOrNumberOrDate {
    if (dataItem.label) {
      return dataItem.label;
    }
    return dataItem.name;
  }

  trackBy(index: number, bar: Bar): string {
    return bar.label;
  }

  trackDataLabelBy(index: number, barLabel: any): string {
    return index + '#' + barLabel.series + '#' + barLabel.total;
  }

  click(data: DataItem): void {
    this.select.emit(data);
  }
}
