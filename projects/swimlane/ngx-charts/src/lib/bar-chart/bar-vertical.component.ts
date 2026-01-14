import {
  Component,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  SimpleChanges
} from '@angular/core';
import { scaleBand, scaleLinear } from 'd3-scale';

import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { DataItem } from '../models/chart-data.model';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { select } from 'd3-selection';
import { BarVerticalChartOptions } from './bar-chart.model';



@Component({
  selector: 'ngx-charts-bar-vertical',
  templateUrl: './bar-vertical.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class BarVerticalComponent extends BaseChartComponent {
  @Input() config: BarVerticalChartOptions;

  @Output() activate: EventEmitter<unknown> = new EventEmitter();
  @Output() deactivate: EventEmitter<unknown> = new EventEmitter();

  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  xScale: any;
  yScale: any;
  xDomain: string[];
  yDomain: [number, number];
  transform: string;
  colors: ColorHelper;
  margin: number[] = [10, 20, 10, 20];
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  legendOptions: LegendOptions;
  dataLabelMaxHeight: { negative: number; positive: number } = { negative: 0, positive: 0 };

  // Getters to maintain template compatibility and default values
  get legend() {
    return this.config?.legend ?? false;
  }
  get legendTitle() {
    return this.config?.legendTitle ?? 'Legend';
  }
  get legendPosition() {
    return this.config?.legendPosition ?? LegendPosition.Right;
  }
  get xAxis() {
    return this.config?.xAxis;
  }
  get yAxis() {
    return this.config?.yAxis;
  }
  get showXAxisLabel() {
    return this.config?.showXAxisLabel;
  }
  get showYAxisLabel() {
    return this.config?.showYAxisLabel;
  }
  get xAxisLabel() {
    return this.config?.xAxisLabel;
  }
  get yAxisLabel() {
    return this.config?.yAxisLabel;
  }
  get tooltipDisabled() {
    return this.config?.tooltipDisabled ?? false;
  }
  get gradient() {
    return this.config?.gradient;
  }
  get referenceLines() {
    return this.config?.referenceLines;
  }
  get showRefLines() {
    return this.config?.showRefLines;
  }
  get showRefLabels() {
    return this.config?.showRefLabels;
  }
  get showGridLines() {
    return this.config?.showGridLines ?? true;
  }
  get activeEntries() {
    return this.config?.activeEntries ?? [];
  }
  set activeEntries(value: unknown[]) {
    if (this.config) this.config.activeEntries = value;
  }
  // schemeType is inherited from BaseChartComponent, so we don't define a getter/setter here to avoid TS2611.
  // We sync it in ngOnChanges.

  get trimXAxisTicks() {
    return this.config?.trimXAxisTicks ?? true;
  }
  get trimYAxisTicks() {
    return this.config?.trimYAxisTicks ?? true;
  }
  get rotateXAxisTicks() {
    return this.config?.rotateXAxisTicks ?? true;
  }
  get maxXAxisTickLength() {
    return this.config?.maxXAxisTickLength ?? 16;
  }
  get maxYAxisTickLength() {
    return this.config?.maxYAxisTickLength ?? 16;
  }
  get xAxisTickFormatting() {
    return this.config?.xAxisTickFormatting;
  }
  get yAxisTickFormatting() {
    return this.config?.yAxisTickFormatting;
  }
  get xAxisTicks() {
    return this.config?.xAxisTicks;
  }
  get yAxisTicks() {
    return this.config?.yAxisTicks;
  }
  get barPadding() {
    return this.config?.barPadding ?? 8;
  }
  get roundDomains() {
    return this.config?.roundDomains ?? false;
  }
  get roundEdges() {
    return this.config?.roundEdges ?? true;
  }
  get yScaleMax() {
    return this.config?.yScaleMax;
  }
  get yScaleMin() {
    return this.config?.yScaleMin;
  }
  get showDataLabel() {
    return this.config?.showDataLabel ?? false;
  }
  get dataLabelFormatting() {
    return this.config?.dataLabelFormatting;
  }
  get noBarWhenZero() {
    return this.config?.noBarWhenZero ?? true;
  }
  get wrapTicks() {
    return this.config?.wrapTicks ?? false;
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

    if (!this.showDataLabel) {
      this.dataLabelMaxHeight = { negative: 0, positive: 0 };
    }
    this.margin = [10 + this.dataLabelMaxHeight.positive, 20, 10 + this.dataLabelMaxHeight.negative, 20];

    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: this.xAxis,
      showYAxis: this.yAxis,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showXLabel: this.showXAxisLabel,
      showYLabel: this.showYAxisLabel,
      showLegend: this.legend,
      legendType: this.schemeType,
      legendPosition: this.legendPosition
    });

    this.formatDates();

    if (this.showDataLabel) {
      this.dims.height -= this.dataLabelMaxHeight.negative;
    }
    this.xScale = this.getXScale();
    this.yScale = this.getYScale();

    this.setColors();
    this.legendOptions = this.getLegendOptions();

    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0] + this.dataLabelMaxHeight.negative})`;

    if (this.showRefLines) {
      const parent = select(this.chartElement.nativeElement).select('.bar-chart').node() as HTMLElement;
      const refLines = select(this.chartElement.nativeElement).selectAll('.ref-line').nodes() as HTMLElement[];
      refLines.forEach(line => parent.appendChild(line));
    }
  }

  getXScale(): any {
    this.xDomain = this.getXDomain();
    const spacing = this.xDomain.length / (this.dims.width / this.barPadding + 1);
    return scaleBand().range([0, this.dims.width]).paddingInner(spacing).domain(this.xDomain);
  }

  getYScale(): any {
    this.yDomain = this.getYDomain();
    const scale = scaleLinear().range([this.dims.height, 0]).domain(this.yDomain);
    return this.roundDomains ? scale.nice() : scale;
  }

  getXDomain(): string[] {
    return this.results.map(d => d.label);
  }

  getYDomain(): [number, number] {
    const values = this.results.map(d => d.value);

    let min = this.yScaleMin ? Math.min(this.yScaleMin, ...values) : Math.min(0, ...values);
    if (this.yAxisTicks && !this.yAxisTicks.some(isNaN)) {
      min = Math.min(min, ...(this.yAxisTicks as number[]));
    }

    let max = this.yScaleMax ? Math.max(this.yScaleMax, ...values) : Math.max(0, ...values);
    if (this.yAxisTicks && !this.yAxisTicks.some(isNaN)) {
      max = Math.max(max, ...(this.yAxisTicks as number[]));
    }
    return [min, max];
  }

  onClick(data: DataItem | string) {
    this.select.emit(data);
  }

  setColors(): void {
    let domain;
    if (this.schemeType === ScaleType.Ordinal) {
      domain = this.xDomain;
    } else {
      domain = this.yDomain;
    }

    this.colors = new ColorHelper(this.scheme, this.schemeType, domain, this.customColors);
  }

  getLegendOptions() {
    const opts = {
      scaleType: this.schemeType,
      colors: undefined,
      domain: [],
      title: undefined,
      position: this.legendPosition
    };
    if (opts.scaleType === ScaleType.Ordinal) {
      opts.domain = this.xDomain;
      opts.colors = this.colors;
      opts.title = this.legendTitle;
    } else {
      opts.domain = this.yDomain;
      opts.colors = this.colors.scale;
    }
    return opts;
  }

  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  onDataLabelMaxHeightChanged(event) {
    if (event.size.negative) {
      this.dataLabelMaxHeight.negative = Math.max(this.dataLabelMaxHeight.negative, event.size.height);
    } else {
      this.dataLabelMaxHeight.positive = Math.max(this.dataLabelMaxHeight.positive, event.size.height);
    }
    if (event.index === this.results.length - 1) {
      setTimeout(() => this.update());
    }
  }

  onActivate(item, fromLegend = false) {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = (this.activeEntries as unknown as { name: string; value: unknown; series: unknown }[]).findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });
    if (idx > -1) {
      return;
    }

    this.activeEntries = [item, ...this.activeEntries];
    this.activate.emit({ value: item, entries: this.activeEntries });
  }

  onDeactivate(item, fromLegend = false) {
    item = this.results.find(d => {
      if (fromLegend) {
        return d.label === item.name;
      } else {
        return d.name === item.name;
      }
    });

    const idx = (this.activeEntries as unknown as { name: string; value: unknown; series: unknown }[]).findIndex(d => {
      return d.name === item.name && d.value === item.value && d.series === item.series;
    });

    this.activeEntries.splice(idx, 1);
    this.activeEntries = [...this.activeEntries];

    this.deactivate.emit({ value: item, entries: this.activeEntries });
  }
}
