import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleLinear, scaleTime, scalePoint } from 'd3-scale';
import { curveCardinalClosed } from 'd3-shape';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { getScaleType } from '../common/domain.helper';
import { isDate } from '../utils/types';
import { LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { Orientation } from '../common/types/orientation.enum';
import { isPlatformServer } from '@angular/common';

const twoPI = 2 * Math.PI;



import { PolarChartOptions } from './polar-chart.options';

@Component({
  selector: 'ngx-charts-polar-chart',
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
      <svg:g class="polar-chart chart" [attr.transform]="transform">
        <svg:g [attr.transform]="transformPlot">
          <svg:circle
            class="polar-chart-background"
            cx="0"
            cy="0"
            [attr.r]="this.outerRadius"
          />
          <svg:g *ngIf="config.showGridLines ?? true">
            <svg:circle
              *ngFor="let r of radiusTicks"
              class="gridline-path radial-gridline-path"
              cx="0"
              cy="0"
              [attr.r]="r"
            />
          </svg:g>
          <svg:g *ngIf="config.xAxis">
            <svg:g 
              *ngFor="let tick of thetaTicks"
              ngx-charts-pie-label
              [config]="{
                data: tick,
                radius: outerRadius,
                label: tick.label,
                color: '',
                max: outerRadius,
                value: (config.showGridLines ?? true) ? 1 : outerRadius,
                explodeSlices: true,
                animations: animations,
                labelTrim: config.labelTrim ?? true,
                labelTrimSize: config.labelTrimSize ?? 10
              }"
            ></svg:g>
          </svg:g>
        </svg:g>
        <svg:g
          ngx-charts-y-axis
          [attr.transform]="transformYAxis"
          *ngIf="config.yAxis"
          [yScale]="yAxisScale"
          [dims]="yAxisDims"
          [showGridLines]="config.showGridLines ?? true"
          [showLabel]="config.showYAxisLabel"
          [labelText]="config.yAxisLabel"
          [trimTicks]="config.trimYAxisTicks ?? true"
          [maxTickLength]="config.maxYAxisTickLength ?? 16"
          [tickFormatting]="config.yAxisTickFormatting"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:g
          ngx-charts-axis-label
          *ngIf="config.xAxis && config.showXAxisLabel"
          [label]="config.xAxisLabel"
          [offset]="labelOffset"
          [orient]="orientation.Bottom"
          [height]="dims.height"
          [width]="dims.width"
        ></svg:g>
        <svg:g *ngIf="!isSSR" [attr.transform]="transformPlot">
          <svg:g
            *ngFor="let series of results; trackBy: trackBy"
            [@animationState]="'active'"
          >
            <svg:g
              ngx-charts-polar-series
              [gradient]="config.gradient ?? false"
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [activeEntries]="config.activeEntries ?? []"
              [scaleType]="scaleType"
              [curve]="config.curve ?? curve"
              [rangeFillOpacity]="config.rangeFillOpacity ?? 0.15"
              [animations]="animations"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              (select)="onClick($event)"
              (activate)="onActivate($event)"
              (deactivate)="onDeactivate($event)"
            />
          </svg:g>
        </svg:g>
        <svg:g *ngIf="isSSR" [attr.transform]="transformPlot">
          <svg:g *ngFor="let series of results; trackBy: trackBy">
            <svg:g
              ngx-charts-polar-series
              [gradient]="config.gradient ?? false"
              [xScale]="xScale"
              [yScale]="yScale"
              [colors]="colors"
              [data]="series"
              [activeEntries]="config.activeEntries ?? []"
              [scaleType]="scaleType"
              [curve]="config.curve ?? curve"
              [rangeFillOpacity]="config.rangeFillOpacity ?? 0.15"
              [animations]="animations"
              [tooltipDisabled]="config.tooltipDisabled ?? false"
              [tooltipTemplate]="tooltipTemplate"
              (select)="onClick($event)"
              (activate)="onActivate($event)"
              (deactivate)="onDeactivate($event)"
            />
          </svg:g>
        </svg:g>
      </svg:g>
    </ngx-charts-chart>
  `,
  styleUrls: [
    '../common/base-chart.component.scss',
    '../pie-chart/pie-chart.component.scss',
    './polar-chart.component.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(
          500,
          style({
            opacity: 0
          })
        )
      ])
    ])
  ],
  standalone: false
})
export class PolarChartComponent extends BaseChartComponent implements OnInit {
  @Input() config: PolarChartOptions = {};

  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  yAxisDims: ViewDimensions;
  labelOffset: number;
  xDomain: unknown[];
  yDomain: unknown[];
  seriesDomain: unknown[];
  yScale: any; // -> rScale
  xScale: any; // -> tScale
  yAxisScale: any; // -> yScale
  colors: ColorHelper;
  scaleType: ScaleType;
  transform: string;
  transformPlot: string;
  transformYAxis: string;
  transformXAxis: string;
  // series: any; // ???
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  filteredDomain: unknown;
  legendOptions: unknown;
  thetaTicks: any[];
  radiusTicks: number[];
  outerRadius: number;

  orientation = Orientation;

  isSSR = false;
  curve: any = curveCardinalClosed; // Internal default if not overridden

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.isSSR = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    // Check config for content changes
    if (changes.config) {
      if (!this.areConfigsEqual(changes.config.previousValue, changes.config.currentValue)) {
        shouldUpdate = true;
        if (this.config && this.config.schemeType) {
          this.schemeType = this.config.schemeType;
        }
      }
    }

    // Checks if any other input changed
    if (Object.keys(changes).some(k => k !== 'config')) {
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      this.update();
    }
  }

  update(): void {
    super.update();

    this.setDims();

    this.setScales();
    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.setTicks();
  }

  setDims() {
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
      showLegend: this.config.legend,
      legendType: this.schemeType,
      legendPosition: this.config.legendPosition
    });

    const halfWidth = Math.floor(this.dims.width / 2);
    const halfHeight = Math.floor(this.dims.height / 2);

    const outerRadius = (this.outerRadius = Math.min(halfHeight / 1.5, halfWidth / 1.5));

    const yOffset = Math.max(0, halfHeight - outerRadius);

    this.yAxisDims = {
      ...this.dims,
      width: halfWidth
    };

    this.transform = `translate(${this.dims.xOffset}, ${this.margin[0]})`;
    this.transformYAxis = `translate(0, ${yOffset})`;
    this.labelOffset = this.dims.height + 40;
    this.transformPlot = `translate(${halfWidth}, ${halfHeight})`;
  }

  setScales() {
    const xValues = this.getXValues();
    this.scaleType = getScaleType(xValues);
    this.xDomain = (this.filteredDomain as unknown[]) || this.getXDomain(xValues);

    this.yDomain = this.getYDomain();
    this.seriesDomain = this.getSeriesDomain();

    this.xScale = this.getXScale(this.xDomain, twoPI);
    this.yScale = this.getYScale(this.yDomain, this.outerRadius);
    this.yAxisScale = this.getYScale(this.yDomain.reverse(), this.outerRadius);
  }

  setTicks() {
    let tickFormat;
    if (this.config.xAxisTickFormatting) {
      tickFormat = this.config.xAxisTickFormatting;
    } else if (this.xScale.tickFormat) {
      tickFormat = this.xScale.tickFormat.apply(this.xScale, [5]);
    } else {
      tickFormat = d => {
        if (isDate(d)) {
          return d.toLocaleDateString();
        }
        return d.toLocaleString();
      };
    }

    const outerRadius = this.outerRadius;
    const s = 1.1;

    this.thetaTicks = (this.xDomain as any[]).map(d => {
      const startAngle = this.xScale(d);
      const dd = s * outerRadius * (startAngle > Math.PI ? -1 : 1);
      const label = tickFormat(d);

      const startPos = [outerRadius * Math.sin(startAngle), -outerRadius * Math.cos(startAngle)];
      const pos = [dd, s * startPos[1]];
      return {
        innerRadius: 0,
        outerRadius,
        startAngle,
        endAngle: startAngle,
        value: outerRadius,
        label,
        startPos,
        pos
      };
    });

    const minDistance = 10;

    /* from pie chart, abstract out -*/
    for (let i = 0; i < this.thetaTicks.length - 1; i++) {
      const a = this.thetaTicks[i];

      for (let j = i + 1; j < this.thetaTicks.length; j++) {
        const b = this.thetaTicks[j];
        // if they're on the same side
        if (b.pos[0] * a.pos[0] > 0) {
          // if they're overlapping
          const o = minDistance - Math.abs(b.pos[1] - a.pos[1]);
          if (o > 0) {
            // push the second up or down
            b.pos[1] += Math.sign(b.pos[0]) * o;
          }
        }
      }
    }

    this.radiusTicks = this.yAxisScale.ticks(Math.floor(this.dims.height / 50)).map(d => this.yScale(d));
  }

  getXValues(): any[] {
    const values = [];
    for (const results of this.results) {
      for (const d of results.series) {
        if (!values.includes(d.name)) {
          values.push(d.name);
        }
      }
    }
    return values;
  }

  getXDomain(values = this.getXValues()): any[] {
    if (this.scaleType === ScaleType.Time) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      return [min, max];
    } else if (this.scaleType === ScaleType.Linear) {
      values = values.map(v => Number(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      return [min, max];
    }
    return values;
  }

  getYValues(): any[] {
    const domain = [];

    for (const results of this.results) {
      for (const d of results.series) {
        if (domain.indexOf(d.value) < 0) {
          domain.push(d.value);
        }
        if (d.min !== undefined) {
          if (domain.indexOf(d.min) < 0) {
            domain.push(d.min);
          }
        }
        if (d.max !== undefined) {
          if (domain.indexOf(d.max) < 0) {
            domain.push(d.max);
          }
        }
      }
    }
    return domain;
  }

  getYDomain(domain = this.getYValues()): any[] {
    let min = Math.min(...domain);
    const max = Math.max(this.config.yAxisMinScale ?? 0, ...domain);

    min = Math.max(0, min);
    if (!this.config.autoScale) {
      min = Math.min(0, min);
    }

    return [min, max];
  }

  getSeriesDomain(): any[] {
    return this.results.map(d => d.name);
  }

  getXScale(domain, width: number): any {
    switch (this.scaleType) {
      case ScaleType.Time:
        return scaleTime().range([0, width]).domain(domain);
      case ScaleType.Linear: {
        const scale = scaleLinear().range([0, width]).domain(domain);
        return (this.config.roundDomains ?? false) ? scale.nice() : scale;
      }
      default:
        return scalePoint()
          .range([0, width - twoPI / domain.length])
          .padding(0)
          .domain(domain);
    }
  }

  getYScale(domain, height: number): any {
    const scale = scaleLinear().range([0, height]).domain(domain);

    return (this.config.roundDomains ?? false) ? scale.nice() : scale;
  }

  onClick(data, series?): void {
    if (series) {
      data.series = series.name;
    }

    this.select.emit(data);
  }

  setColors(): void {
    const domain = this.schemeType === ScaleType.Ordinal ? this.seriesDomain : this.yDomain.reverse();
    this.colors = new ColorHelper(this.scheme, this.schemeType, domain as string[] | number[], this.customColors);
  }

  getLegendOptions() {
    if (this.schemeType === ScaleType.Ordinal) {
      return {
        scaleType: this.schemeType,
        colors: this.colors,
        domain: this.seriesDomain,
        title: this.config.legendTitle ?? 'Legend',
        position: this.config.legendPosition ?? LegendPosition.Right
      };
    }
    return {
      scaleType: this.schemeType,
      colors: this.colors.scale,
      domain: this.yDomain,
      title: undefined,
      position: this.config.legendPosition ?? LegendPosition.Right
    };
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
    const idx = (this.config.activeEntries as unknown as { name: string; value: unknown }[]).findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }
    this.config.activeEntries = (this.config.showSeriesOnHover ?? true) ? [item, ...(this.config.activeEntries || [])] : (this.config.activeEntries || []);
    this.activate.emit({ value: item, entries: this.config.activeEntries });
  }

  onDeactivate(item): void {
    const idx = (this.config.activeEntries as unknown as { name: string; value: unknown }[]).findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });

    this.config.activeEntries.splice(idx, 1);
    this.config.activeEntries = [...this.config.activeEntries];

    this.deactivate.emit({ value: item, entries: this.config.activeEntries });
  }

  deactivateAll(): void {
    this.config.activeEntries = [...(this.config.activeEntries || [])];
    for (const entry of this.config.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.config.activeEntries = [];
  }

  trackBy(index: number, item): string {
    return `${item.name}`;
  }
}
