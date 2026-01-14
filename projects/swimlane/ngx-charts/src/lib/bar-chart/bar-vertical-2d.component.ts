import {
  Component,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  TrackByFunction
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleBand, scaleLinear } from 'd3-scale';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { DataItem } from '../models/chart-data.model';

import { BaseChartComponent } from '../common/base-chart.component';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { isPlatformServer } from '@angular/common';

import { BarVertical2DOptions } from './bar-vertical-2d.options';

@Component({
  selector: 'ngx-charts-bar-vertical-2d',
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
          ngx-charts-grid-panel-series
          [xScale]="groupScale"
          [yScale]="valueScale"
          [data]="results"
          [dims]="dims"
          [orient]="barOrientation.Vertical"
        ></svg:g>
        <svg:g
          ngx-charts-x-axis
          *ngIf="config.xAxis"
          [xScale]="groupScale"
          [dims]="dims"
          [showLabel]="config.showXAxisLabel"
          [labelText]="config.xAxisLabel"
          [trimTicks]="config.trimXAxisTicks ?? true"
          [rotateTicks]="config.rotateXAxisTicks ?? true"
          [maxTickLength]="config.maxXAxisTickLength ?? 16"
          [tickFormatting]="config.xAxisTickFormatting"
          [ticks]="config.xAxisTicks"
          [xAxisOffset]="dataLabelMaxHeight.negative"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateXAxisHeight($event)"
        ></svg:g>
        <svg:g
          ngx-charts-y-axis
          *ngIf="config.yAxis"
          [yScale]="valueScale"
          [dims]="dims"
          [showGridLines]="config.showGridLines ?? true"
          [showLabel]="config.showYAxisLabel"
          [labelText]="config.yAxisLabel"
          [trimTicks]="config.trimYAxisTicks ?? true"
          [maxTickLength]="config.maxYAxisTickLength ?? 16"
          [tickFormatting]="config.yAxisTickFormatting"
          [ticks]="config.yAxisTicks"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g *ngIf="!isSSR">
          <svg:g
            ngx-charts-series-vertical
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
            [activeEntries]="config.activeEntries ?? []"
            [xScale]="innerScale"
            [yScale]="valueScale"
            [colors]="colors"
            [series]="group.series"
            [dims]="dims"
            [gradient]="config.gradient"
            [tooltipDisabled]="config.tooltipDisabled ?? false"
            [tooltipTemplate]="tooltipTemplate"
            [showDataLabel]="config.showDataLabel ?? false"
            [dataLabelFormatting]="config.dataLabelFormatting"
            [seriesName]="group.name"
            [roundEdges]="config.roundEdges ?? true"
            [animations]="animations"
            [noBarWhenZero]="config.noBarWhenZero ?? true"
            (select)="onClick($event, group)"
            (activate)="onActivate($event, group)"
            (deactivate)="onDeactivate($event, group)"
            (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
          ></svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g
            ngx-charts-series-vertical
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [attr.transform]="groupTransform(group)"
            [activeEntries]="config.activeEntries ?? []"
            [xScale]="innerScale"
            [yScale]="valueScale"
            [colors]="colors"
            [series]="group.series"
            [dims]="dims"
            [gradient]="config.gradient"
            [tooltipDisabled]="config.tooltipDisabled ?? false"
            [tooltipTemplate]="tooltipTemplate"
            [showDataLabel]="config.showDataLabel ?? false"
            [dataLabelFormatting]="config.dataLabelFormatting"
            [seriesName]="group.name"
            [roundEdges]="config.roundEdges ?? true"
            [animations]="animations"
            [noBarWhenZero]="config.noBarWhenZero ?? true"
            (select)="onClick($event, group)"
            (activate)="onActivate($event, group)"
            (deactivate)="onDeactivate($event, group)"
            (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
          ></svg:g>
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class BarVertical2DComponent extends BaseChartComponent {
  @Input() config: BarVertical2DOptions = {};

  // Compatibility getters for old individual inputs
  @Input() set gradient(value: boolean) { this.config.gradient = value; }
  get gradient(): boolean { return this.config.gradient; }

  @Input() set xAxis(value: boolean) { this.config.xAxis = value; }
  get xAxis(): boolean { return this.config.xAxis; }

  @Input() set yAxis(value: boolean) { this.config.yAxis = value; }
  get yAxis(): boolean { return this.config.yAxis; }

  @Input() set legend(value: boolean) { this.config.legend = value; }
  get legend(): boolean { return this.config.legend; }

  @Input() set legendTitle(value: string) { this.config.legendTitle = value; }
  get legendTitle(): string { return this.config.legendTitle; }

  @Input() set legendPosition(value: LegendPosition) { this.config.legendPosition = value; }
  get legendPosition(): LegendPosition { return this.config.legendPosition; }

  @Input() set showXAxisLabel(value: boolean) { this.config.showXAxisLabel = value; }
  get showXAxisLabel(): boolean { return this.config.showXAxisLabel; }

  @Input() set showYAxisLabel(value: boolean) { this.config.showYAxisLabel = value; }
  get showYAxisLabel(): boolean { return this.config.showYAxisLabel; }

  @Input() set tooltipDisabled(value: boolean) { this.config.tooltipDisabled = value; }
  get tooltipDisabled(): boolean { return this.config.tooltipDisabled; }

  @Input() set xAxisLabel(value: string) { this.config.xAxisLabel = value; }
  get xAxisLabel(): string { return this.config.xAxisLabel; }

  @Input() set yAxisLabel(value: string) { this.config.yAxisLabel = value; }
  get yAxisLabel(): string { return this.config.yAxisLabel; }

  @Input() set showGridLines(value: boolean) { this.config.showGridLines = value; }
  get showGridLines(): boolean { return this.config.showGridLines; }

  @Input() set barPadding(value: number) { this.config.barPadding = value; }
  get barPadding(): number { return this.config.barPadding; }

  @Input() set groupPadding(value: number) { this.config.groupPadding = value; }
  get groupPadding(): number { return this.config.groupPadding; }

  @Input() set roundDomains(value: boolean) { this.config.roundDomains = value; }
  get roundDomains(): boolean { return this.config.roundDomains; }

  @Input() set roundEdges(value: boolean) { this.config.roundEdges = value; }
  get roundEdges(): boolean { return this.config.roundEdges; }

  @Input() set yScaleMax(value: number) { this.config.yScaleMax = value; }
  get yScaleMax(): number { return this.config.yScaleMax; }

  @Input() set noBarWhenZero(value: boolean) { this.config.noBarWhenZero = value; }
  get noBarWhenZero(): boolean { return this.config.noBarWhenZero; }

  @Input() set showDataLabel(value: boolean) { this.config.showDataLabel = value; }
  get showDataLabel(): boolean { return this.config.showDataLabel; }

  @Input() set trimXAxisTicks(value: boolean) { this.config.trimXAxisTicks = value; }
  get trimXAxisTicks(): boolean { return this.config.trimXAxisTicks; }

  @Input() set trimYAxisTicks(value: boolean) { this.config.trimYAxisTicks = value; }
  get trimYAxisTicks(): boolean { return this.config.trimYAxisTicks; }

  @Input() set rotateXAxisTicks(value: boolean) { this.config.rotateXAxisTicks = value; }
  get rotateXAxisTicks(): boolean { return this.config.rotateXAxisTicks; }

  @Input() set maxXAxisTickLength(value: number) { this.config.maxXAxisTickLength = value; }
  get maxXAxisTickLength(): number { return this.config.maxXAxisTickLength; }

  @Input() set maxYAxisTickLength(value: number) { this.config.maxYAxisTickLength = value; }
  get maxYAxisTickLength(): number { return this.config.maxYAxisTickLength; }

  @Input() set wrapTicks(value: boolean) { this.config.wrapTicks = value; }
  get wrapTicks(): boolean { return this.config.wrapTicks; }


  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;

  dims: ViewDimensions;
  groupDomain: string[];
  innerDomain: string[];
  valueDomain: [number, number];
  groupScale: any;
  innerScale: any;
  valueScale: any;
  transform: string;
  colors: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  dataLabelMaxHeight: any = { negative: 0, positive: 0 };
  isSSR = false;

  barOrientation = BarOrientation;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.isSSR = true;
    }
  }

  update(): void {
    super.update();

    if (!(this.config.showDataLabel ?? false)) {
      this.dataLabelMaxHeight = { negative: 0, positive: 0 };
    }
    this.margin = [10 + this.dataLabelMaxHeight.positive, 20, 10 + this.dataLabelMaxHeight.negative, 20];

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.config.xAxis,
      showYAxis: this.config.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.config.showXAxisLabel,
      showYLabel: this.config.showYAxisLabel,
      showLegend: this.config.legend ?? false,
      legendType: this.config.schemeType ?? ScaleType.Ordinal,
      legendPosition: this.config.legendPosition ?? LegendPosition.Right
    });

    if (this.config.showDataLabel ?? false) {
      this.dims.height -= this.dataLabelMaxHeight.negative;
    }

    this.formatDates();

    this.groupDomain = this.getGroupDomain();
    this.innerDomain = this.getInnerDomain();
    this.valueDomain = this.getValueDomain();

    this.groupScale = this.getGroupScale();
    this.innerScale = this.getInnerScale();
    this.valueScale = this.getValueScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();
    this.transform = `translate(${this.dims.xOffset
      }, ${this.margin[0] + this.dataLabelMaxHeight.negative})`;
  }

  onDataLabelMaxHeightChanged(event, groupIndex: number): void {
    if (event.size.negative) {
      this.dataLabelMaxHeight.negative = Math.max(this.dataLabelMaxHeight.negative, event.size.height);
    } else {
      this.dataLabelMaxHeight.positive = Math.max(this.dataLabelMaxHeight.positive, event.size.height);
    }
    if (groupIndex === this.results.length - 1) {
      setTimeout(() => this.update());
    }
  }

  getGroupScale(): any {
    const spacing = this.groupDomain.length / (this.dims.height / (this.config.groupPadding ?? 16) + 1);

    return scaleBand()
      .rangeRound([0, this.dims.width])
      .paddingInner(spacing)
      .paddingOuter(spacing / 2)
      .domain(this.groupDomain);
  }

  getInnerScale(): any {
    const width = this.groupScale.bandwidth();
    const spacing = this.innerDomain.length / (width / (this.config.barPadding ?? 8) + 1);
    return scaleBand().rangeRound([0, width]).paddingInner(spacing).domain(this.innerDomain);
  }

  getValueScale(): any {
    const scale = scaleLinear().range([this.dims.height, 0]).domain(this.valueDomain);
    return (this.config.roundDomains ?? false) ? scale.nice() : scale;
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
    for (const group of this.results) {
      for (const d of group.series) {
        if (!domain.includes(d.value)) {
          domain.push(d.value);
        }
      }
    }

    const min = Math.min(0, ...domain);
    const max = this.config.yScaleMax ? Math.max(this.config.yScaleMax, ...domain) : Math.max(0, ...domain);

    return [min, max];
  }

  groupTransform(group: DataItem): string {
    return `translate(${this.groupScale(group.label)}, 0)`;
  }

  onClick(data, group?: DataItem): void {
    if (group) {
      data.series = group.name;
    }

    this.select.emit(data);
  }

  trackBy: TrackByFunction<DataItem> = (index: number, item: DataItem) => {
    return item.name;
  };

  setColors(): void {
    let domain;
    if ((this.config.schemeType ?? ScaleType.Ordinal) === ScaleType.Ordinal) {
      domain = this.innerDomain;
    } else {
      domain = this.valueDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.config.schemeType ?? ScaleType.Ordinal, domain, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    const opts = {
      scaleType: (this.config.schemeType ?? ScaleType.Ordinal) as any,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.config.legendPosition ?? LegendPosition.Right
    };
    if (opts.scaleType === ScaleType.Ordinal) {
      opts.domain = this.innerDomain;
      opts.colors = this.colors;
      opts.title = this.config.legendTitle ?? 'Legend';
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

  onActivate(event, group: DataItem, fromLegend: boolean = false): void {
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

  onDeactivate(event, group: DataItem, fromLegend: boolean = false): void {
    const item = Object.assign({}, event);
    if (group) {
      item.series = group.name;
    }

    this.config.activeEntries = (this.config.activeEntries as unknown as { name: string; series: unknown; label: string }[]).filter(
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
