import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { scaleBand } from 'd3-scale';

import { BaseChartComponent } from '../common/base-chart.component';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { getScaleType } from '../common/domain.helper';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { calculateInnerPadding } from '../utils/calculate-padding';
import { getHeatMapDomains, getHeatMapRects, RectItem } from './heat-map.utils';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ScaleType } from '../common/types/scale-type.enum';

export { RectItem };

import { HeatMapOptions } from './heat-map.options';

@Component({
  selector: 'ngx-charts-heat-map',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="config.legend ?? false"
      [animations]="animations"
      [legendOptions]="legendOptions"
      (legendLabelClick)="onClick($event)"
    >
      <svg:g [attr.transform]="transform" class="heat-map chart">
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
          [showLabel]="config.showYAxisLabel"
          [labelText]="config.yAxisLabel"
          [trimTicks]="config.trimYAxisTicks ?? true"
          [maxTickLength]="config.maxYAxisTickLength ?? 16"
          [tickFormatting]="config.yAxisTickFormatting"
          [ticks]="config.yAxisTicks"
          [wrapTicks]="config.wrapTicks ?? false"
          (dimensionsChanged)="updateYAxisWidth($event)"
        ></svg:g>
        <svg:rect
          *ngFor="let rect of rects"
          [attr.x]="rect.x"
          [attr.y]="rect.y"
          [attr.rx]="rect.rx"
          [attr.width]="rect.width"
          [attr.height]="rect.height"
          [attr.fill]="rect.fill"
        />
        <svg:g
          ngx-charts-heat-map-cell-series
          [xScale]="xScale"
          [yScale]="yScale"
          [colors]="colors"
          [data]="results"
          [gradient]="config.gradient"
          [animations]="animations"
          [tooltipDisabled]="config.tooltipDisabled ?? false"
          [tooltipTemplate]="tooltipTemplate"
          [tooltipText]="config.tooltipText"
          (select)="onClick($event)"
          (activate)="onActivate($event, undefined)"
          (deactivate)="onDeactivate($event, undefined)"
        />
      </svg:g>
    </ngx-charts-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class HeatMapComponent extends BaseChartComponent {
  @Input() config: HeatMapOptions = {};

  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  xDomain: string[];
  yDomain: string[];
  valueDomain: number[];
  xScale: any;
  yScale: any;
  colors: ColorHelper;
  colorScale: unknown;
  transform: string;
  rects: RectItem[];
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  scaleType: ScaleType = ScaleType.Linear;

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    // Check config for content changes
    if (changes.config) {
      if (!this.areConfigsEqual(changes.config.previousValue, changes.config.currentValue)) {
        shouldUpdate = true;
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

    this.formatDates();

    const domains = getHeatMapDomains(this.results);
    this.xDomain = domains.xDomain;
    this.yDomain = domains.yDomain;
    this.valueDomain = domains.valueDomain;

    this.scaleType = getScaleType(this.valueDomain, false);

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
      legendType: this.scaleType as any,
      legendPosition: this.config.legendPosition ?? LegendPosition.Right
    });

    if (this.scaleType === ScaleType.Linear) {
      let min = this.config.min;
      let max = this.config.max;
      if (!this.config.min) {
        min = Math.min(0, ...(this.valueDomain as number[]));
      }
      if (!this.config.max) {
        max = Math.max(...(this.valueDomain as number[]));
      }
      this.valueDomain = [min, max];
    }

    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.rects = getHeatMapRects(this.xDomain, this.yDomain, this.xScale, this.yScale);
  }

  getXScale(): any {
    const f = calculateInnerPadding(this.config.innerPadding ?? 8, 0, this.xDomain.length, this.dims.width);
    return scaleBand().rangeRound([0, this.dims.width]).domain(this.xDomain).paddingInner(f);
  }

  getYScale(): any {
    const f = calculateInnerPadding(this.config.innerPadding ?? 8, 1, this.yDomain.length, this.dims.height);
    return scaleBand().rangeRound([this.dims.height, 0]).domain(this.yDomain).paddingInner(f);
  }

  onClick(data): void {
    this.select.emit(data);
  }

  setColors(): void {
    this.colors = new ColorHelper(this.scheme, this.scaleType, this.valueDomain as string[] | number[]);
  }

  getLegendOptions(): LegendOptions {
    return {
      scaleType: this.scaleType,
      domain: this.valueDomain,
      colors: this.scaleType === ScaleType.Ordinal ? this.colors : this.colors.scale,
      title: this.scaleType === ScaleType.Ordinal ? (this.config.legendTitle ?? 'Legend') : undefined,
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

  onActivate(event, group, fromLegend: boolean = false) {
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

  onDeactivate(event, group, fromLegend: boolean = false) {
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
