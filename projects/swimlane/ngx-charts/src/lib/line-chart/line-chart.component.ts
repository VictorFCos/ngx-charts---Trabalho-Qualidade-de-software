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
  OnInit,
  SimpleChanges
} from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { scaleLinear } from 'd3-scale';
import { curveLinear } from 'd3-shape';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { BaseChartComponent } from '../common/base-chart.component';
import { id } from '../utils/id';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ScaleType } from '../common/types/scale-type.enum';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { isPlatformServer } from '@angular/common';
import { getLineChartXDomain, getLineChartYDomain, getLineChartXScale } from './line-chart.helper';

export interface LineChartOptions {
  legend: boolean;
  legendTitle: string;
  legendPosition: LegendPosition;
  xAxis: boolean;
  yAxis: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  autoScale: boolean;
  timeline: boolean;
  gradient: boolean;
  showGridLines: boolean;
  curve: unknown;
  activeEntries: unknown[];
  schemeType: ScaleType;
  rangeFillOpacity: number;
  trimXAxisTicks: boolean;
  trimYAxisTicks: boolean;
  rotateXAxisTicks: boolean;
  maxXAxisTickLength: number;
  maxYAxisTickLength: number;
  xAxisTickFormatting: (o: unknown) => string;
  yAxisTickFormatting: (o: unknown) => string;
  xAxisTicks: unknown[];
  yAxisTicks: unknown[];
  roundDomains: boolean;
  tooltipDisabled: boolean;
  showRefLines: boolean;
  referenceLines: unknown;
  showRefLabels: boolean;
  xScaleMin: number;
  xScaleMax: number;
  yScaleMin: number;
  yScaleMax: number;
  wrapTicks: boolean;
}

@Component({
  selector: 'ngx-charts-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['../common/base-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [transition(':leave', [style({ opacity: 1 }), animate(500, style({ opacity: 0 }))])])
  ],
  standalone: false
})
export class LineChartComponent extends BaseChartComponent implements OnInit {
  @Input() config: LineChartOptions;
  @Output() activate = new EventEmitter<unknown>();
  @Output() deactivate = new EventEmitter<unknown>();
  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;
  @ContentChild('seriesTooltipTemplate') seriesTooltipTemplate: TemplateRef<unknown>;

  dims: ViewDimensions;
  xSet: any;
  xDomain: unknown;
  yDomain: [number, number];
  seriesDomain: unknown;
  yScale: any;
  xScale: any;
  colors: ColorHelper;
  scaleType: ScaleType;
  transform: string;
  clipPath: string;
  clipPathId: string;
  margin: number[] = [10, 20, 10, 20];
  hoveredVertical: any;
  xAxisHeight: number = 0;
  yAxisWidth: number = 0;
  filteredDomain: any;
  legendOptions: any;
  hasRange: boolean;
  timelineWidth: any;
  timelineHeight: number = 50;
  timelineXScale: any;
  timelineYScale: any;
  timelineXDomain: any;
  timelineTransform: any;
  timelinePadding: number = 10;
  isSSR = false;

  get legend() {
    return this.config?.legend;
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
  get autoScale() {
    return this.config?.autoScale;
  }
  get timeline() {
    return this.config?.timeline;
  }
  get gradient() {
    return this.config?.gradient;
  }
  get showGridLines() {
    return this.config?.showGridLines ?? true;
  }
  @Input()
  get curve() {
    return this.config?.curve ?? curveLinear;
  }
  set curve(val: unknown) {
    if (this.config) this.config.curve = val;
  }
  @Input()
  get activeEntries() {
    return this.config?.activeEntries ?? [];
  }
  set activeEntries(value: unknown[]) {
    if (this.config) this.config.activeEntries = value;
  }
  get rangeFillOpacity() {
    return this.config?.rangeFillOpacity;
  }
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
  @Input()
  get xAxisTickFormatting() {
    return this.config?.xAxisTickFormatting;
  }
  set xAxisTickFormatting(val: (o: unknown) => string) {
    if (this.config) this.config.xAxisTickFormatting = val;
  }
  @Input()
  get yAxisTickFormatting() {
    return this.config?.yAxisTickFormatting;
  }
  set yAxisTickFormatting(val: (o: unknown) => string) {
    if (this.config) this.config.yAxisTickFormatting = val;
  }
  get xAxisTicks() {
    return this.config?.xAxisTicks;
  }
  get yAxisTicks() {
    return this.config?.yAxisTicks;
  }
  get roundDomains() {
    return this.config?.roundDomains ?? false;
  }
  get tooltipDisabled() {
    return this.config?.tooltipDisabled ?? false;
  }
  get showRefLines() {
    return this.config?.showRefLines ?? false;
  }
  @Input()
  get referenceLines() {
    return this.config?.referenceLines;
  }
  set referenceLines(val: unknown) {
    if (this.config) this.config.referenceLines = val;
  }
  get showRefLabels() {
    return this.config?.showRefLabels ?? true;
  }
  get xScaleMin() {
    return this.config?.xScaleMin;
  }
  get xScaleMax() {
    return this.config?.xScaleMax;
  }
  get yScaleMin() {
    return this.config?.yScaleMin;
  }
  get yScaleMax() {
    return this.config?.yScaleMax;
  }
  get wrapTicks() {
    return this.config?.wrapTicks ?? false;
  }

  ngOnInit() {
    if (isPlatformServer(this.platformId)) this.isSSR = true;
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
    if (this.timeline) this.dims.height -= this.timelineHeight + this.margin[2] + this.timelinePadding;
    const xDom = getLineChartXDomain(this.results, this.xScaleMin, this.xScaleMax);
    this.xDomain = this.filteredDomain || xDom.domain;
    this.scaleType = xDom.scaleType;
    this.xSet = xDom.xSet;
    const yDom = getLineChartYDomain(this.results, this.autoScale, this.yScaleMin, this.yScaleMax);
    this.yDomain = yDom.domain;
    this.hasRange = yDom.hasRange;
    this.seriesDomain = this.results.map(d => d.name);
    this.xScale = getLineChartXScale(this.xDomain as any[], this.dims.width, this.scaleType, this.roundDomains);
    this.yScale = scaleLinear().range([this.dims.height, 0]).domain(this.yDomain);
    if (this.roundDomains) this.yScale = this.yScale.nice();
    if (this.timeline) {
      this.timelineWidth = this.dims.width;
      this.timelineXScale = getLineChartXScale(xDom.domain, this.timelineWidth, this.scaleType, this.roundDomains);
      this.timelineYScale = scaleLinear().range([this.timelineHeight, 0]).domain(this.yDomain);
      this.timelineTransform = `translate(${this.dims.xOffset}, ${-this.margin[2]})`;
    }
    this.colors = new ColorHelper(
      this.scheme,
      this.schemeType,
      (this.schemeType === ScaleType.Ordinal ? this.seriesDomain : this.yDomain) as string[],
      this.customColors
    );
    this.legendOptions = {
      scaleType: this.schemeType,
      colors: this.schemeType === ScaleType.Ordinal ? this.colors : this.colors.scale,
      domain: (this.schemeType === ScaleType.Ordinal ? this.seriesDomain : this.yDomain) as unknown[],
      title: this.schemeType === ScaleType.Ordinal ? this.legendTitle : undefined,
      position: this.legendPosition
    };
    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = getLineChartXScale(this.xDomain as any[], this.dims.width, this.scaleType, this.roundDomains);
  }
  updateHoveredVertical(item): void {
    this.hoveredVertical = item.value;
    this.deactivateAll();
  }
  @HostListener('mouseleave') hideCircles(): void {
    this.hoveredVertical = null;
    this.deactivateAll();
  }
  onClick(data): void {
    this.select.emit(data);
  }
  trackBy(index: number, item): string {
    return `${item.name}`;
  }
  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }
  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }
  onActivate(item): void {
    this.deactivateAll();
    if (
      !(this.activeEntries as unknown as { name: string; value: unknown }[]).some(
        d => d.name === item.name && d.value === item.value
      )
    ) {
      this.activeEntries = [item];
      this.activate.emit({ value: item, entries: this.activeEntries });
    }
  }
  onDeactivate(item): void {
    const idx = (this.activeEntries as unknown as { name: string; value: unknown }[]).findIndex(
      d => d.name === item.name && d.value === item.value
    );
    if (idx > -1) {
      this.activeEntries.splice(idx, 1);
      this.activeEntries = [...this.activeEntries];
      this.deactivate.emit({ value: item, entries: this.activeEntries });
    }
  }
  deactivateAll(): void {
    this.activeEntries.forEach(entry => this.deactivate.emit({ value: entry, entries: [] }));
    this.activeEntries = [];
  }
}
