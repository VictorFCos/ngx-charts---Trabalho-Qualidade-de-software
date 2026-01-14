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
import { LineChartOptions } from './line-chart.model';



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
  curve: any;


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
    this.curve = this.config?.curve ?? curveLinear;
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
      showLegend: this.config?.legend,
      legendType: this.schemeType,
      legendPosition: this.config?.legendPosition ?? LegendPosition.Right
    });
    if (this.config?.timeline) this.dims.height -= this.timelineHeight + this.margin[2] + this.timelinePadding;
    const xDom = getLineChartXDomain(this.results, this.config?.xScaleMin, this.config?.xScaleMax);
    this.xDomain = this.filteredDomain || xDom.domain;
    this.scaleType = xDom.scaleType;
    this.xSet = xDom.xSet;
    const yDom = getLineChartYDomain(this.results, this.config?.autoScale, this.config?.yScaleMin, this.config?.yScaleMax);
    this.yDomain = yDom.domain;
    this.hasRange = yDom.hasRange;
    this.seriesDomain = this.results.map(d => d.name);
    this.xScale = getLineChartXScale(this.xDomain as any[], this.dims.width, this.scaleType, this.config?.roundDomains ?? false);
    this.yScale = scaleLinear().range([this.dims.height, 0]).domain(this.yDomain);
    if (this.config?.roundDomains) this.yScale = this.yScale.nice();
    if (this.config?.timeline) {
      this.timelineWidth = this.dims.width;
      this.timelineXScale = getLineChartXScale(xDom.domain, this.timelineWidth, this.scaleType, this.config?.roundDomains ?? false);
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
      title: this.schemeType === ScaleType.Ordinal ? (this.config?.legendTitle ?? 'Legend') : undefined,
      position: this.config?.legendPosition ?? LegendPosition.Right
    };
    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.clipPathId = 'clip' + id().toString();
    this.clipPath = `url(#${this.clipPathId})`;
  }

  updateDomain(domain): void {
    this.filteredDomain = domain;
    this.xDomain = this.filteredDomain;
    this.xScale = getLineChartXScale(this.xDomain as any[], this.dims.width, this.scaleType, this.config?.roundDomains ?? false);
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
      !(this.config?.activeEntries as unknown as { name: string; value: unknown }[]).some(
        d => d.name === item.name && d.value === item.value
      )
    ) {
      this.config.activeEntries = [item];
      this.activate.emit({ value: item, entries: this.config.activeEntries });
    }
  }
  onDeactivate(item): void {
    const idx = (this.config?.activeEntries as unknown as { name: string; value: unknown }[]).findIndex(
      d => d.name === item.name && d.value === item.value
    );
    if (idx > -1) {
      this.config.activeEntries.splice(idx, 1);
      this.config.activeEntries = [...this.config.activeEntries];
      this.deactivate.emit({ value: item, entries: this.config.activeEntries });
    }
  }
  deactivateAll(): void {
    (this.config?.activeEntries ?? []).forEach(entry => this.deactivate.emit({ value: entry, entries: [] }));
    if (this.config) {
      this.config.activeEntries = [];
    }
  }
}
