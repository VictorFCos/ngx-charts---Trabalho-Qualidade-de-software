import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  HostListener,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  TrackByFunction,
  SimpleChanges
} from '@angular/core';
import { scaleLinear, scalePoint, scaleTime } from 'd3-scale';
import { CurveFactory, curveLinear } from 'd3-shape';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { id } from '../utils/id';
import { getUniqueXDomainValues, getScaleType } from '../common/domain.helper';
import { isDate, isNumber } from '../utils/types';
import { Series } from '../models/chart-data.model';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ScaleType } from '../common/types/scale-type.enum';
import { select } from 'd3-selection';

import { AreaChartOptions } from './area-chart.options';

@Component({
  selector: 'ngx-charts-area-chart',
  templateUrl: './area-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class AreaChartComponent extends BaseChartComponent {
  @Input() config: AreaChartOptions;

  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;
  @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  xSet: any;
  xDomain: unknown[];
  yDomain: [number, number];
  seriesDomain: string[];
  xScale: any;
  yScale: any;
  transform: string;
  colors: ColorHelper;
  clipPathId: string;
  clipPath: string;
  scaleType: ScaleType;
  series: Series;
  margin: number[] = [10, 20, 10, 20];
  hoveredVertical: any; // the value of the x axis that is hovered over
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  filteredDomain: any;
  legendOptions: LegendOptions;

  timelineWidth: number;
  timelineHeight: number = 50;
  timelineXScale: any;
  timelineYScale: any;
  timelineXDomain: unknown[];
  timelineTransform: string;
  timelinePadding: number = 10;



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

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.config?.xAxis ?? false,
      showYAxis: this.config?.yAxis ?? false,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.config?.showXAxisLabel,
      showYLabel: this.config?.showYAxisLabel,
      showLegend: this.config?.legend ?? false,
      legendType: this.schemeType,
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

    this.updateTimeline();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset}, ${this.margin[0]})`;

    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;

    const parent = select(this.chartElement.nativeElement).select('.area-chart').node() as HTMLElement;
    const refLines = select(this.chartElement.nativeElement).selectAll('.ref-line').nodes() as HTMLElement[];
    refLines.forEach(line => parent.appendChild(line));
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

  getXDomain(): unknown[] {
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

    for (const results of this.results) {
      for (const d of results.series) {
        if (!domain.includes(d.value)) {
          domain.push(d.value);
        }
      }
    }

    const values = [...domain];
    if (!(this.config?.autoScale ?? false)) {
      values.push(0);
    }
    const baseValue = this.config?.baseValue ?? 'auto';
    if (baseValue !== 'auto') {
      values.push(baseValue as number);
    }

    const min = this.config?.yScaleMin ? this.config?.yScaleMin : Math.min(...values);

    const max = this.config?.yScaleMax ? this.config?.yScaleMax : Math.max(...values);

    return [min, max];
  }

  getSeriesDomain(): string[] {
    return this.results.map(d => d.name);
  }

  getXScale(domain, width: number): number {
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

  getYScale(domain: [number, number], height: number): any {
    const scale = scaleLinear().range([height, 0]).domain(domain);
    return (this.config?.roundDomains ?? false) ? scale.nice() : scale;
  }

  getScaleType(values): ScaleType {
    let date = true;
    let num = true;
    for (const value of values) {
      if (isDate(value)) {
        date = false;
      }
      if (isNumber(value)) {
        num = false;
      }
    }

    if (date) {
      return ScaleType.Time;
    }

    if (num) {
      return ScaleType.Linear;
    }

    return ScaleType.Ordinal;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = this.getXScale(this.xDomain, this.dims.width);
  }

  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }

  @HostListener('mouseleave')
  hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }

  onClick(data, series?: Series): void {
    if (series) {
      data.series = series.name;
    }

    this.select.emit(data);
  }

  trackBy: TrackByFunction<Series> = (index: number, item: Series) => {
    return item.name;
  };

  setColors(): void {
    let domain;
    if (this.schemeType === ScaleType.Ordinal) {
      domain = this.seriesDomain;
    } else {
      domain = this.yDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.schemeType, domain as any, this.customColors);
  }

  getLegendOptions(): LegendOptions {
    const opts: LegendOptions = {
      scaleType: this.schemeType as any,
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
    const idx = (this.config.activeEntries as unknown as { name: string; value: unknown }[]).findIndex(d => {
      return d.name === item.name && d.value === item.value;
    });
    if (idx > -1) {
      return;
    }

    this.config.activeEntries = [item, ...this.config.activeEntries];
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
    this.config.activeEntries = [...this.config.activeEntries];
    for (const entry of this.config.activeEntries) {
      this.deactivate.emit({ value: entry, entries: [] });
    }
    this.config.activeEntries = [];
  }
}
