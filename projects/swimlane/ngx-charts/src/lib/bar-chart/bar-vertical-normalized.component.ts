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

import { BarVerticalNormalizedOptions } from './bar-vertical-normalized.options';

@Component({
  selector: 'ngx-charts-bar-vertical-normalized',
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
            *ngFor="let group of results; trackBy: trackBy"
            [@animationState]="'active'"
            [attr.transform]="groupTransform(group)"
          >
            <svg:g
              ngx-charts-series-vertical
              [type]="barChartType.Normalized"
              [xScale]="xScale"
              [yScale]="yScale"
              [activeEntries]="config.activeEntries ?? []"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="config.gradient"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [animations]="animations"
              [noBarWhenZero]="config.noBarWhenZero ?? true"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
            ></svg:g>
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR">
          <svg:g *ngFor="let group of results; trackBy: trackBy" [attr.transform]="groupTransform(group)">
            <svg:g
              ngx-charts-series-vertical
              [type]="barChartType.Normalized"
              [xScale]="xScale"
              [yScale]="yScale"
              [activeEntries]="config.activeEntries ?? []"
              [colors]="colors"
              [series]="group.series"
              [dims]="dims"
              [gradient]="config.gradient"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              [seriesName]="group.name"
              [animations]="animations"
              [noBarWhenZero]="config.noBarWhenZero ?? true"
              (select)="onClick($event, group)"
              (activate)="onActivate($event, group)"
              (deactivate)="onDeactivate($event, group)"
            ></svg:g>
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
export class BarVerticalNormalizedComponent extends BaseChartComponent {
  @Input() config: BarVerticalNormalizedOptions = {};
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
  @Input() set noBarWhenZero(v: boolean) { this.config.noBarWhenZero = v; } get noBarWhenZero(): boolean { return this.config.noBarWhenZero; }
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
  valueDomain: [number, number] = [0, 100];
  xScale: Function;
  yScale: Function;
  transform: string;
  colors: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  isSSR = false;

  barChartType = BarChartType;

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.isSSR = true;
    }
  }

  update(): void {
    super.update();

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

    this.formatDates();

    this.groupDomain = this.getGroupDomain();
    this.innerDomain = this.getInnerDomain();

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
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

  getXScale() {
    const spacing = this.groupDomain.length / (this.dims.width / (this.config.barPadding ?? 8) + 1);

    return scaleBand().rangeRound([0, this.dims.width]).paddingInner(spacing).domain(this.groupDomain);
  }

  getYScale() {
    const scale = scaleLinear().range([this.dims.height, 0]).domain(this.valueDomain);
    return (this.config.roundDomains ?? false) ? scale.nice() : scale;
  }

  groupTransform(group: Series): string {
    return `translate(${this.xScale(group.name)}, 0)`;
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
    if (this.config.schemeType === ScaleType.Ordinal) {
      domain = this.innerDomain;
    } else {
      domain = this.valueDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.config.schemeType ?? ScaleType.Ordinal, domain, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    const opts = {
      scaleType: this.config.schemeType as any,
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

  updateYAxisWidth({ width }: { width: number }) {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }: { height: number }) {
    this.xAxisHeight = height;
    this.update();
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

    this.config.activeEntries = (this.config.activeEntries as unknown as {
      name: string;
      series: unknown;
      label: string;
    }[]).filter(i => {
      if (fromLegend) {
        return i.label !== item.name;
      } else {
        return !(i.name === item.name && i.series === item.series);
      }
    });

    this.deactivate.emit({ value: item, entries: this.config.activeEntries });
  }
}
