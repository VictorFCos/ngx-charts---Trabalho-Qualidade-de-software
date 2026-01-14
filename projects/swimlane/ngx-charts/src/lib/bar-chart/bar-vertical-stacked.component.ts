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

import { BarVerticalStackedOptions } from './bar-vertical-stacked.options';

@Component({
  selector: 'ngx-charts-bar-vertical-stacked',
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
          [yScale]="yScale"
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
            *ngFor="let group of results; let index = index; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-vertical
              [type]="barChartType.Stacked"
              [xScale]="xScale"
              [yScale]="yScale"
              [activeEntries]="config.activeEntries ?? []"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="config.gradient"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              [showDataLabel]="config.showDataLabel ?? false"
              [dataLabelFormatting]="config.dataLabelFormatting"
              [seriesName]="group.name"
              [animations]="animations"
              [noBarWhenZero]="config.noBarWhenZero ?? true"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
              (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
            ></svg:g>
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g *ngIf="isSSR">
            <svg:g
              *ngFor="let group of results; let index = index; trackBy: trackBy"
              [attr.transform]="groupTransform(group)"
            >
              <svg:g
                ngx-charts-series-vertical
                [type]="barChartType.Stacked"
                [xScale]="xScale"
                [yScale]="yScale"
                [activeEntries]="config.activeEntries ?? []"
                [colors]="colors"
                [series]="group.series"
                [dims]="dims"
                [gradient]="config.gradient"
                [tooltipDisabled]="config.tooltipDisabled ?? false"
                [tooltipTemplate]="tooltipTemplate"
                [showDataLabel]="config.showDataLabel ?? false"
                [dataLabelFormatting]="config.dataLabelFormatting"
                [seriesName]="group.name"
                [animations]="animations"
                [noBarWhenZero]="config.noBarWhenZero ?? true"
                (select)="onClick($event, group)"
                (activate)="onActivate($event, group)"
                (deactivate)="onDeactivate($event, group)"
                (dataLabelHeightChanged)="onDataLabelMaxHeightChanged($event, index)"
              ></svg:g>
            </svg:g>
          </svg:g>
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
export class BarVerticalStackedComponent extends BaseChartComponent {
  @Input() config: BarVerticalStackedOptions = {};

  // Compatibility getters
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
  @Input() set legendPosition(value: any) { this.config.legendPosition = value; }
  get legendPosition(): any { return this.config.legendPosition; }
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
  @Input() set roundDomains(value: boolean) { this.config.roundDomains = value; }
  get roundDomains(): boolean { return this.config.roundDomains; }
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

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  groupDomain: string[];
  innerDomain: string[];
  valueDomain: [number, number];
  xScale: Function;
  yScale: Function;
  transform: string;
  tickFormatting: (label: string) => string;
  colors: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  dataLabelMaxHeight: { negative: number; positive: number } = { negative: 0, positive: 0 };
  isSSR = false;

  barChartType = BarChartType;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.isSSR = true;
    }
  }

  ngOnChanges(): void {
    this.update();
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

    if (this.config.showDataLabel ?? false) {
      this.dims.height -= this.dataLabelMaxHeight.negative;
    }

    this.formatDates();

    this.groupDomain = this.getGroupDomain();
    this.innerDomain = this.getInnerDomain();
    this.valueDomain = this.getValueDomain();

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset
      }, ${this.margin[0] + this.dataLabelMaxHeight.negative})`;
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
    const max = this.config?.yScaleMax ? Math.max(this.config?.yScaleMax, ...domain) : Math.max(...domain);
    return [min, max];
  }

  getXScale() {
    const spacing = this.groupDomain.length / (this.dims.width / (this.config?.barPadding ?? 8) + 1);
    return scaleBand().rangeRound([0, this.dims.width]).paddingInner(spacing).domain(this.groupDomain);
  }

  getYScale() {
    const scale = scaleLinear().range([this.dims.height, 0]).domain(this.valueDomain);
    return (this.config?.roundDomains ?? false) ? scale.nice() : scale;
  }

  onDataLabelMaxHeightChanged(event, groupIndex: number) {
    if (event.size.negative) {
      this.dataLabelMaxHeight.negative = Math.max(this.dataLabelMaxHeight.negative, event.size.height);
    } else {
      this.dataLabelMaxHeight.positive = Math.max(this.dataLabelMaxHeight.positive, event.size.height);
    }
    if (groupIndex === this.results.length - 1) {
      setTimeout(() => this.update());
    }
  }

  groupTransform(group: Series): string {
    return `translate(${this.xScale(group.name) || 0}, 0)`;
  }

  onClick(data, group?: Series) {
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

  onActivate(event, group, fromLegend: boolean = false): void {
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
