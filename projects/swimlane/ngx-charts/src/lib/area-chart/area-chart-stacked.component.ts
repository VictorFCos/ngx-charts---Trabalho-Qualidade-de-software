import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  HostListener,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { curveLinear } from 'd3-shape';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { id } from '../utils/id';
import { getUniqueXDomainValues, getScaleType } from '../common/domain.helper';
import { SeriesType } from '../common/circle-series.component';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ScaleType } from '../common/types/scale-type.enum';

import { AreaChartStackedOptions } from './area-chart-stacked.options';

@Component({
  selector: 'ngx-charts-area-chart-stacked',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="config.legend ?? false"
      [legendOptions]="legendOptions"
      [activeEntries]="config.activeEntries ?? []"
      [animations]="animations"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
    >
      <svg:defs>
        <svg:clipPath [attr.id]="clipPathId">
          <svg:rect
            [attr.width]="dims.width + 10"
            [attr.height]="dims.height + 10"
            [attr.transform]="'translate(-5, -5)'"
          />
        </svg:clipPath>
      </svg:defs>
      <svg:g [attr.transform]="transform" class="area-chart chart">
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
        <svg:g [attr.clip-path]="clipPath">
          <svg:g *ngFor="let series of results; trackBy: trackBy">
            <svg:g
              ngx-charts-area-series
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [scaleType]="scaleType"
              [gradient]="config.gradient"
              [activeEntries]="config.activeEntries ?? []"
              [stacked]="true"
              [curve]="config.curve || curve"
              [animations]="animations"
            />
          </svg:g>

          <svg:g *ngIf="!(config.tooltipDisabled ?? false)" (mouseleave)="hideCircles()">
            <svg:g
              ngx-charts-tooltip-area
              [dims]="dims"
              [xSet]="xSet"
              [xScale]="xScale"
              [yScale]="yScale"
              [results]="results"
              [colors]="colors"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="seriesTooltipTemplate"
              (hover)="updateHoveredVertical($event)"
            />

            <svg:g *ngFor="let series of results">
              <svg:g
                ngx-charts-circle-series
                [type]="seriesType.Stacked"
                [xScale]="xScale"
                [yScale]="yScale"
                [colors]="colors"
                [activeEntries]="config.activeEntries ?? []"
                [data]="series"
                [scaleType]="scaleType"
                [visibleValue]="hoveredVertical"
                [tooltipDisabled]="config.tooltipDisabled ?? false"
                [tooltipTemplate]="tooltipTemplate"
                (select)="onClick($event, series)"
                (activate)="onActivate($event)"
                (deactivate)="onDeactivate($event)"
              />
            </svg:g>
          </svg:g>
        </svg:g>
      </svg:g>
      <svg:g
        ngx-charts-timeline
        *ngIf="(config.timeline ?? false) && scaleType != 'ordinal'"
        [attr.transform]="timelineTransform"
        [results]="results"
        [view]="[timelineWidth, height]"
        [height]="timelineHeight"
        [scheme]="scheme"
        [customColors]="customColors"
        [legend]="config.legend ?? false"
        [scaleType]="scaleType"
        (onDomainChange)="updateDomain($event)"
      >
        <svg:g *ngFor="let series of results; trackBy: trackBy">
          <svg:g
            ngx-charts-area-series
            [xScale]="timelineXScale"
            [yScale]="timelineYScale"
            [colors]="colors"
            [data]="series"
            [scaleType]="scaleType"
            [gradient]="config.gradient"
            [stacked]="true"
            [curve]="config.curve || curve"
            [animations]="animations"
          />
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class AreaChartStackedComponent extends BaseChartComponent {
  @Input() config: AreaChartStackedOptions = {};
  curve: any = curveLinear;


  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() deactivate: EventEmitter<any> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<any>;
  @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<any>;

  dims: ViewDimensions;
  scaleType: ScaleType;
  xDomain: any[];
  xSet: any[]; // the set of all values on the X Axis
  yDomain: [number, number];
  seriesDomain: any;
  xScale: any;
  yScale: any;
  transform: string;
  clipPathId: string;
  clipPath: string;
  colors: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  hoveredVertical: any; // the value of the x axis that is hovered over
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  filteredDomain: any;
  legendOptions: any;

  timelineWidth: number;
  timelineHeight: number = 50;
  timelineXScale: any;
  timelineYScale: any;
  timelineXDomain: any;
  timelineTransform: any;
  timelinePadding: number = 10;

  seriesType = SeriesType;

  update(): void {
    super.update();

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

    if (this.config?.timeline) {
      this.dims.height -= this.timelineHeight + this.margin[2] + this.timelinePadding;
    }

    this.xDomain = this.getXDomain();
    if (this.filteredDomain) {
      this.xDomain = this.filteredDomain;
    }

    this.yDomain = this.getYDomain();
    this.seriesDomain = this.getSeriesDomain();

    this.xScale = this.getXScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);

    for (let i = 0; i < this.xSet.length; i++) {
      const val = this.xSet[i];
      let d0 = 0;
      for (const group of this.results) {
        let d = group.series.find(item => {
          let a = item.name;
          let b = val;
          if (this.scaleType === ScaleType.Time) {
            a = a.valueOf();
            b = b.valueOf();
          }
          return a === b;
        });

        if (d) {
          d.d0 = d0;
          d.d1 = d0 + d.value;
          d0 += d.value;
        } else {
          d = {
            name: val,
            value: 0,
            d0,
            d1: d0
          };
          group.series.push(d);
        }
      }
    }

    this.updateTimeline();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset
      }, ${this.margin[0]})`;

    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;
  }

  updateTimeline(): void {
    if (this.config?.timeline) {
      this.timelineWidth = this.dims.width;
      this.timelineXDomain = this.getXDomain();
      this.timelineXScale = this.getXScale(this.timelineXDomain, this.timelineWidth);
      this.timelineYScale = this.getYScale(this.yDomain, this.timelineHeight);
      this.timelineTransform = `translate(${this.dims.xOffset}, ${-this.margin[2]})`;
    }
  }

  getXDomain(): any[] {
    let values = getUniqueXDomainValues(this.results);

    this.scaleType = getScaleType(values);
    let domain = [];

    if (this.scaleType === ScaleType.Linear) {
      values = values.map(v => Number(v));
    }

    let min;
    let max;
    if (this.scaleType === ScaleType.Time || this.scaleType === ScaleType.Linear) {
      min = this.config?.xScaleMin ? this.config?.xScaleMin : Math.min(...values);

      max = this.config?.xScaleMax ? this.config?.xScaleMax : Math.max(...values);
    }

    if (this.scaleType === ScaleType.Time) {
      domain = [new Date(min), new Date(max)];
      this.xSet = [...values].sort((a, b) => {
        const aDate = a.getTime();
        const bDate = b.getTime();
        if (aDate > bDate) return 1;
        if (bDate > aDate) return -1;
        return 0;
      });
    } else if (this.scaleType === ScaleType.Linear) {
      domain = [min, max];
      // Use compare function to sort numbers numerically
      this.xSet = [...values].sort((a, b) => a - b);
    } else {
      domain = values;
      this.xSet = values;
    }

    return domain;
  }

  getYDomain(): [number, number] {
    const domain = [];

    for (let i = 0; i < this.xSet.length; i++) {
      const val = this.xSet[i];
      let sum = 0;
      for (const group of this.results) {
        const d = group.series.find(item => {
          let a = item.name;
          let b = val;
          if (this.scaleType === ScaleType.Time) {
            a = a.valueOf();
            b = b.valueOf();
          }
          return a === b;
        });

        if (d) {
          sum += d.value;
        }
      }

      domain.push(sum);
    }

    const min = this.config?.yScaleMin ? this.config?.yScaleMin : Math.min(0, ...domain);

    const max = this.config?.yScaleMax ? this.config?.yScaleMax : Math.max(...domain);
    return [min, max];
  }

  getSeriesDomain(): string[] {
    return this.results.map(d => d.name);
  }

  getXScale(domain, width: number): any {
    let scale;

    if (this.scaleType === ScaleType.Time) {
      scale = scaleTime();
    } else if (this.scaleType === ScaleType.Linear) {
      scale = scaleLinear();
    } else if (this.scaleType === ScaleType.Ordinal) {
      scale = scalePoint().padding(0.1);
    }

    scale.range([0, width]).domain(domain);

    return (this.config?.roundDomains ?? false) ? scale.nice() : scale;
  }

  getYScale(domain, height: number): any {
    const scale = scaleLinear().range([height, 0]).domain(domain);
    return (this.config?.roundDomains ?? false) ? scale.nice() : scale;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = this.getXScale(this.xDomain, this.dims.width);
  }

  updateHoveredVertical(item) {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  onClick(data, series?): void {
    if (series) {
      data.series = series.name;
    }

    this.select.emit(data);
  }

  trackBy(index, item): string {
    return `${item.name} `;
  }

  setColors(): void {
    let domain;
    if ((this.config.schemeType ?? ScaleType.Ordinal) === ScaleType.Ordinal) {
      domain = this.seriesDomain;
    } else {
      domain = this.yDomain;
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
      opts.domain = this.seriesDomain;
      opts.colors = this.colors;
      opts.title = this.config?.legendTitle ?? 'Legend';
    } else {
      opts.domain = this.yDomain;
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

  onActivate(item): void {
    const entries = this.config.activeEntries ?? [];
    const idx = entries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }

    this.config.activeEntries = [item, ...entries];
    this.activate.emit({ value: item, entries: this.config.activeEntries });
  }

  onDeactivate(item): void {
    const entries = this.config.activeEntries ?? [];
    const idx = entries.findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });

    if (idx > -1) {
      entries.splice(idx, 1);
      this.config.activeEntries = [...entries];

      this.deactivate.emit({ value: item, entries: this.config.activeEntries });
    }
  }

  deactivateAll() {
    const entries = this.config.activeEntries ?? [];
    this.config.activeEntries = [...entries];
    for (const entry of this.config.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.config.activeEntries = [];
  }
}
