import {
  Component,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { DataItem } from '../models/chart-data.model';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ScaleType } from '../common/types/scale-type.enum';

export interface PieChartConfig {
  labels: boolean;
  legend: boolean;
  legendTitle: string;
  legendPosition: LegendPosition;
  explodeSlices: boolean;
  doughnut: boolean;
  arcWidth: number;
  gradient: boolean;
  activeEntries: any[];
  tooltipDisabled: boolean;
  labelFormatting: any;
  trimLabels: boolean;
  maxLabelLength: number;
  tooltipText: any;
  margins: number[];
}

@Component({
  selector: 'ngx-charts-pie-chart',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelActivate)="onActivate($event, true)"
      (legendLabelDeactivate)="onDeactivate($event, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="translation" class="pie-chart chart">
        <svg:g
          ngx-charts-pie-series
          [colors]="colors"
          [series]="data"
          [showLabels]="labels"
          [labelFormatting]="labelFormatting"
          [trimLabels]="trimLabels"
          [maxLabelLength]="maxLabelLength"
          [activeEntries]="activeEntries"
          [innerRadius]="innerRadius"
          [outerRadius]="outerRadius"
          [explodeSlices]="explodeSlices"
          [gradient]="gradient"
          [animations]="animations"
          [tooltipDisabled]="tooltipDisabled"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="tooltipText"
          (dblclick)="dblclick.emit($event)"
          (select)="onClick($event)"
          (activate)="onActivate($event)"
          (deactivate)="onDeactivate($event)"
        />
      </svg:g>
    </ngx-charts-chart>
  `,
  styleUrls: ['../common/base-chart.component.scss', './pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PieChartComponent extends BaseChartComponent {
  @Input() config: PieChartConfig;

  @Output() dblclick = new EventEmitter();
  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

  translation: string;
  outerRadius: number;
  innerRadius: number;
  data: DataItem[];
  colors: ColorHelper;
  domain: string[];
  dims: ViewDimensions;
  legendOptions: LegendOptions;

  get labels() { return this.config?.labels ?? false; }
  get legend() { return this.config?.legend ?? false; }
  get legendTitle() { return this.config?.legendTitle ?? 'Legend'; }
  get legendPosition() { return this.config?.legendPosition ?? LegendPosition.Right; }
  get explodeSlices() { return this.config?.explodeSlices ?? false; }
  get doughnut() { return this.config?.doughnut ?? false; }
  get arcWidth() { return this.config?.arcWidth ?? 0.25; }
  get gradient() { return this.config?.gradient; }
  get activeEntries() { return this.config?.activeEntries ?? []; }
  set activeEntries(value: any[]) { if (this.config) this.config.activeEntries = value; }
  get tooltipDisabled() { return this.config?.tooltipDisabled ?? false; }
  get labelFormatting() { return this.config?.labelFormatting; }
  get trimLabels() { return this.config?.trimLabels ?? true; }
  get maxLabelLength() { return this.config?.maxLabelLength ?? 10; }
  get tooltipText() { return this.config?.tooltipText; }
  get margins() { return this.config?.margins; }
  set margins(value: number[]) { if (this.config) this.config.margins = value; }

  ngOnChanges(): void {
    this.update();
  }

  update(): void {
    super.update();

    if (this.labels && this.hasNoOptionalMarginsSet()) {
      this.margins = [30, 80, 30, 80];
    } else if (!this.labels && this.hasNoOptionalMarginsSet()) {
      // default value for margins
      this.margins = [20, 20, 20, 20];
    }

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margins,
      showLegend: this.legend,
      legendPosition: this.legendPosition
    });

    this.formatDates();

    const xOffset = this.margins[3] + this.dims.width / 2;
    const yOffset = this.margins[0] + this.dims.height / 2;
    this.translation = `translate(${xOffset}, ${yOffset})`;
    this.outerRadius = Math.min(this.dims.width, this.dims.height);
    if (this.labels) {
      // make room for labels
      this.outerRadius /= 3;
    } else {
      this.outerRadius /= 2;
    }
    this.innerRadius = 0;
    if (this.doughnut) {
      this.innerRadius = this.outerRadius * (1 - this.arcWidth);
    }

    this.domain = this.getDomain();

    // sort data according to domain
    this.data = this.results.sort((a, b) => {
      return this.domain.indexOf(a.name) - this.domain.indexOf(b.name);
    });

    this.setColors();
    this.legendOptions = this.getLegendOptions();
  }

  getDomain(): string[] {
    return this.results.map(d => d.label);
  }

  onClick(data: DataItem | string): void {
    this.select.emit(data);
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, ScaleType.Ordinal, this.domain, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    return {
      scaleType: ScaleType.Ordinal,
      domain: this.domain,
      colors: this.colors,
      title: this.legendTitle,
      position: this.legendPosition
    };
  }

  onActivate(item, fromLegend = false): void {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item, ...this.activeEntries];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item, fromLegend = false): void {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = this.activeEntries.findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }

  private hasNoOptionalMarginsSet(): boolean {
    return !this.margins || this.margins.length <= 0;
  }
}
