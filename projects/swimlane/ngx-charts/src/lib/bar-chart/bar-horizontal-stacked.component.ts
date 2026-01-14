import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  TrackByFunction
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { trigger, style, animate, transition } from '@angular/animations';

import { scaleBand, scaleLinear } from 'd3-scale';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { Series } from '../models/chart-data.model';
import { BaseChartComponent } from '../common/base-chart.component';
import { BarChartType } from './types/bar-chart-type.enum';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';

import { BarHorizontalStackedOptions } from './bar-horizontal-stacked.options';

@Component({
  selector: 'ngx-charts-bar-horizontal-stacked',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="config.legend ?? false"
      [legendOptions]="legendOptions"
      [activeEntries]="config.activeEntries ?? []"
      [animations]="animations"
      (legendLabelActivate)="onActivate($event, undefined, true)"
      (legendLabelDeactivate)="onDeactivate($event, undefined, true)"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="bar-chart chart">
        <svg:g
          ngx-charts-x-axis
          *ngIf="config.xAxis"
          [xScale]="xScale"
          [dims]="dims"
          [showGridLines]="config.showGridLines ?? true"
          [showLabel]="config.showXAxisLabel"
          [labelText]="config.xAxisLabel"
          [trimTicks]="config.trimXAxisTicks ?? true"
          [rotateTicks]="config.rotateXAxisTicks ?? true"
          [maxTickLength]="config.maxXAxisTickLength ?? 16"
          [tickFormatting]="config.xAxisTickFormatting"
          [ticks]="config.xAxisTicks"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="config.yAxis"
          [yScale]="yScale"
          [dims]="dims"
          [showLabel]="config.showYAxisLabel"
          [labelText]="config.yAxisLabel"
          [trimTicks]="config.trimYAxisTicks ?? true"
          [maxTickLength]="config.maxYAxisTickLength ?? 16"
          [tickFormatting]="config.yAxisTickFormatting"
          [ticks]="config.yAxisTicks"
          [yAxisOffset]="dataLabelMaxWidth.negative"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g *ngIf="!isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [type]="barChartType.Stacked"
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [series]="group.series"
              [activeEntries]="config.activeEntries ?? []"
              [dims]="dims"
              [gradient]="config.gradient"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [animations]="animations"
              [showDataLabel]="config.showDataLabel ?? false"
              [dataLabelFormatting]="config.dataLabelFormatting"
              [noBarWhenZero]="config.noBarWhenZero ?? true"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-horizontal
              [type]="barChartType.Stacked"
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [series]="group.series"
              [activeEntries]="config.activeEntries ?? []"
              [dims]="dims"
              [gradient]="config.gradient"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [animations]="animations"
              [showDataLabel]="config.showDataLabel ?? false"
              [dataLabelFormatting]="config.dataLabelFormatting"
              [noBarWhenZero]="config.noBarWhenZero ?? true"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelWidthChanged)="onDataLabelMaxWidthChanged($event, index)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1,
          transform: '*'
        }),
        animate(500, style({ opacity: 0, transform: 'scale(0)' }))
      ])
    ])
  ],
  standalone: false
})
export class BarHorizontalStackedComponent extends BaseChartComponent {
  @Input() config: BarHorizontalStackedOptions = {};
  @Input() set gradient(v: boolean) { this.config.gradient = v; } get gradient(): boolean { return this.config.gradient; }
  @Input() set xAxis(v: boolean) { this.config.xAxis = v; } get xAxis(): boolean { return this.config.xAxis; }
  @Input() set yAxis(v: boolean) { this.config.yAxis = v; } get yAxis(): boolean { return this.config.yAxis; }
  @Input() set legend(v: boolean) { this.config.legend = v; } get legend(): boolean { return this.config.legend; }
  @Input() set legendTitle(v: string) { this.config.legendTitle = v; } get legendTitle(): string { return this.config.legendTitle; }
  @Input() set legendPosition(v: any) { this.config.legendPosition = v; } get legendPosition(): any { return this.config.legendPosition; }
  @Input() set showXAxisLabel(v: boolean) { this.config.showXAxisLabel = v; } get showXAxisLabel(): boolean { return this.config.showXAxisLabel; }
  @Input() set showYAxisLabel(v: boolean) { this.config.showYAxisLabel = v; } get showYAxisLabel(): boolean { return this.config.showYAxisLabel; }
  @Input() set tooltipDisabled(v: boolean) { this.config.tooltipDisabled = v; } get tooltipDisabled(): boolean { return this.config.tooltipDisabled; }
  @Input() set xAxisLabel(v: string) { this.config.xAxisLabel = v; } get xAxisLabel(): string { return this.config.xAxisLabel; }
  @Input() set yAxisLabel(v: string) { this.config.yAxisLabel = v; } get yAxisLabel(): string { return this.config.yAxisLabel; }
  @Input() set showGridLines(v: boolean) { this.config.showGridLines = v; } get showGridLines(): boolean { return this.config.showGridLines; }
  @Input() set barPadding(v: number) { this.config.barPadding = v; } get barPadding(): number { return this.config.barPadding; }
  @Input() set roundDomains(v: boolean) { this.config.roundDomains = v; } get roundDomains(): boolean { return this.config.roundDomains; }
  @Input() set xScaleMax(v: number) { this.config.xScaleMax = v; } get xScaleMax(): number { return this.config.xScaleMax; }
  @Input() set noBarWhenZero(v: boolean) { this.config.noBarWhenZero = v; } get noBarWhenZero(): boolean { return this.config.noBarWhenZero; }
  @Input() set showDataLabel(v: boolean) { this.config.showDataLabel = v; } get showDataLabel(): boolean { return this.config.showDataLabel; }
  @Input() set trimXAxisTicks(v: boolean) { this.config.trimXAxisTicks = v; } get trimXAxisTicks(): boolean { return this.config.trimXAxisTicks; }
  @Input() set trimYAxisTicks(v: boolean) { this.config.trimYAxisTicks = v; } get trimYAxisTicks(): boolean { return this.config.trimYAxisTicks; }
  @Input() set rotateXAxisTicks(v: boolean) { this.config.rotateXAxisTicks = v; } get rotateXAxisTicks(): boolean { return this.config.rotateXAxisTicks; }
  @Input() set maxXAxisTickLength(v: number) { this.config.maxXAxisTickLength = v; } get maxXAxisTickLength(): number { return this.config.maxXAxisTickLength; }
  @Input() set maxYAxisTickLength(v: number) { this.config.maxYAxisTickLength = v; } get maxYAxisTickLength(): number { return this.config.maxYAxisTickLength; }
  @Input() set wrapTicks(v: boolean) { this.config.wrapTicks = v; } get wrapTicks(): boolean { return this.config.wrapTicks; }


  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  groupDomain: string[];
  innerDomain: string[];
  valueDomain: [number, number];
  xScale: Function;
  yScale: Function;
  transform: string;
  colors: ColorHelper;
  margin = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  dataLabelMaxWidth: { negative: number; positive: number } = { negative: 0, positive: 0 };

  barChartType = BarChartType;
  isSSR = false;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.isSSR = true;
    }
  }

  update(): void {
    super.update();

    if (!(this.config.showDataLabel ?? false)) {
      this.dataLabelMaxWidth = { negative: 0, positive: 0 };
    }

    this.margin = [10, 20 + this.dataLabelMaxWidth.positive, 10, 20 + this.dataLabelMaxWidth.negative];

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.config?.xAxis,
      showYAxis: this.config?.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.config?.showXAxisLabel,
      showYLabel: this.config?.showYAxisLabel,
      showLegend: this.config?.legend ?? false,
      legendType: this.config?.schemeType,
      legendPosition: this.config?.legendPosition ?? LegendPosition.Right
    });

    this.formatDates();

    this.groupDomain = this.getGroupDomain();
    this.innerDomain = this.getInnerDomain();
    this.valueDomain = this.getValueDomain();

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset
      }, ${this.margin[0]})`;
  }

  getGroupDomain(): string[] {
    const domain = [];

    for (const group of this.results) {
      if (!domain.includes(group.label)) {
        domain.push(group.label);
      }
    }

    return domain;
  }

  getInnerDomain(): string[] {
    const domain = [];

    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.label)) {
          domain.push(d.label);
        }
      }
    }

    return domain;
  }

  getValueDomain(): [number, number] {
    const domain = [];
    let smallest = 0;
    let biggest = 0;
    for (const group of this.results) {
      let smallestSum = 0;
      let biggestSum = 0;
      for (const d of group.series) {
        if (d.value < 0) {
          smallestSum += d.value;
        } else {
          biggestSum += d.value;
        }
        smallest = d.value < smallest ? d.value : smallest;
        biggest = d.value > biggest ? d.value : biggest;
      }
      domain.push(smallestSum);
      domain.push(biggestSum);
    }
    domain.push(smallest);
    domain.push(biggest);

    const min = Math.min(0, ...domain);
    const max = this.config?.xScaleMax ? Math.max(this.config?.xScaleMax, ...domain) : Math.max(...domain);
    return [min, max];
  }

  getYScale() {
    const spacing = this.groupDomain.length / (this.dims.height / (this.config?.barPadding ?? 8) + 1);

    return scaleBand().rangeRound([0, this.dims.height]).paddingInner(spacing).domain(this.groupDomain);
  }

  getXScale() {
    const scale = scaleLinear().range([0, this.dims.width]).domain(this.valueDomain);
    return (this.config?.roundDomains ?? false) ? scale.nice() : scale;
  }

  groupTransform(group: Series): string {
    return `translate(0, ${this.yScale(group.name)})`;
  }

  onClick(data, group?: Series): void {
    if (group) {
      data.series = group.name;
    }

    this.select.emit(data);
  }

  trackBy: TrackByFunction<Series> = (index: number, item: Series) => {
    return item.name;
  };

  setColors(): void {
    let domain;
    if ((this.config.schemeType ?? ScaleType.Ordinal) === ScaleType.Ordinal) {
      domain = this.innerDomain;
    } else {
      domain = this.valueDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.config?.schemeType ?? ScaleType.Ordinal, domain, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    const opts = {
      scaleType: this.config?.schemeType as any,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.config?.legendPosition ?? LegendPosition.Right
    };
    if (opts.scaleType === ScaleType.Ordinal) {
      opts.domain = this.innerDomain;
      opts.colors = this.colors;
      opts.title = this.config?.legendTitle ?? 'Legend';
    } else {
      opts.domain = this.valueDomain;
      opts.colors = this.colors.scale;
    }

    return opts;
  }

  updateYAxisWidth({ width }: { width: number }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }: { height: number }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onDataLabelMaxWidthChanged(event, groupIndex: number) {
    if (event.size.negative) {
      this.dataLabelMaxWidth.negative = Math.max(this.dataLabelMaxWidth.negative, event.size.width);
    } else {
      this.dataLabelMaxWidth.positive = Math.max(this.dataLabelMaxWidth.positive, event.size.width);
    }
    if (groupIndex === this.results.length - 1) {
      setTimeout(() => this.update());
    }
  }

  onActivate(event, group: Series, fromLegend: boolean = false) {
    const item = Object.assign({}, event);
    if (group) {
      item.series = group.name;
    }

    const items = this.results
      .map(g => g.series)
      .flat()
      .filter(i => {
        if (fromLegend) {
          return i.label === item.name;
        } else {
          return i.name === item.name && i.series === item.series;
        }
      });

    this.config.activeEntries = [...items];
    this.activate.emit({ value: item, entries: this.config.activeEntries });
  }

  onDeactivate(event, group: Series, fromLegend: boolean = false) {
    const item = Object.assign({}, event);
    if (group) {
      item.series = group.name;
    }

    this.config.activeEntries = (this.config.activeEntries as any[]).filter(
      i => {
        if (fromLegend) {
          return i.label !== item.name;
        } else {
          return !(i.name === item.name && i.series === item.series);
        }
      }
    );

    this.deactivate.emit({ value: item, entries: this.config.activeEntries });
  }
}
