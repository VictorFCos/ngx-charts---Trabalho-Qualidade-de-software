import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ContentChild,
  TemplateRef,
  SimpleChanges
} from '@angular/core';
import { scaleLinear } from 'd3-scale';
import { BaseChartComponent } from '../common/base-chart.component';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
import { ArcItem } from './gauge-arc.component';
import { LegendOptions, LegendPosition } from '../common/types/legend.model';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { ScaleType } from '../common/types/scale-type.enum';
import { getGaugeValueDomain, getGaugeDisplayValue, getGaugeArcs } from './gauge.helper';

interface Arcs {
  backgroundArc: ArcItem;
  valueArc: ArcItem;
}

export interface GaugeOptions {
  legend: boolean;
  legendTitle: string;
  legendPosition: LegendPosition;
  min: number;
  max: number;
  textValue: string;
  units: string;
  bigSegments: number;
  smallSegments: number;
  showAxis: boolean;
  startAngle: number;
  angleSpan: number;
  activeEntries: unknown[];
  axisTickFormatting: any; // Keep any for formatting functions if complex or use (o:any)=>string
  tooltipDisabled: boolean;
  valueFormatting: (value: unknown) => string;
  showText: boolean;
  margin: number[];
}

@Component({
  selector: 'ngx-charts-gauge',
  template: `
    <ngx-charts-chart
      [view]="[width, height]"
      [showLegend]="legend"
      [legendOptions]="legendOptions"
      [activeEntries]="activeEntries"
      [animations]="animations"
      (legendLabelClick)="onClick($event)"
      (legendLabelActivate)="onActivate($event)"
      (legendLabelDeactivate)="onDeactivate($event)"
    >
      <svg:g [attr.transform]="transform" class="gauge chart">
        <svg:g *ngFor="let arc of arcs; trackBy: trackBy" [attr.transform]="rotation">
          <svg:g
            ngx-charts-gauge-arc
            [backgroundArc]="arc.backgroundArc"
            [valueArc]="arc.valueArc"
            [cornerRadius]="cornerRadius"
            [colors]="colors"
            [isActive]="isActive(arc.valueArc.data)"
            [tooltipDisabled]="tooltipDisabled"
            [tooltipTemplate]="tooltipTemplate"
            [valueFormatting]="valueFormatting"
            [animations]="animations"
            (select)="onClick($event)"
            (activate)="onActivate($event)"
            (deactivate)="onDeactivate($event)"
          ></svg:g>
        </svg:g>
        <svg:g
          ngx-charts-gauge-axis
          *ngIf="showAxis"
          [bigSegments]="bigSegments"
          [smallSegments]="smallSegments"
          [min]="min"
          [max]="max"
          [radius]="outerRadius"
          [angleSpan]="angleSpan"
          [valueScale]="valueScale"
          [startAngle]="startAngle"
          [tickFormatting]="axisTickFormatting"
        ></svg:g>
        <svg:text
          #textEl
          *ngIf="showText"
          [style.textAnchor]="'middle'"
          [attr.transform]="textTransform"
          alignment-baseline="central"
        >
          <tspan x="0" dy="0">{{ displayValue }}</tspan>
          <tspan x="0" dy="1.2em">{{ units }}</tspan>
        </svg:text>
      </svg:g>
    </ngx-charts-chart>
  `,
  styleUrls: ['../common/base-chart.component.scss', './gauge.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GaugeComponent extends BaseChartComponent implements AfterViewInit {
  @Input() config: GaugeOptions;
  @Output() activate = new EventEmitter<unknown>();
  @Output() deactivate = new EventEmitter<unknown>();
  @ContentChild('tooltipTemplate') tooltipTemplate: TemplateRef<unknown>;
  @ViewChild('textEl') textEl: ElementRef;

  dims: ViewDimensions;
  domain: unknown[];
  valueDomain: [number, number];
  valueScale: any;
  colors: ColorHelper;
  transform: string;
  outerRadius: number;
  textRadius: number;
  resizeScale: number = 1;
  rotation: string = '';
  textTransform: string = 'scale(1, 1)';
  cornerRadius: number = 10;
  arcs: Arcs[];
  displayValue: string;
  legendOptions: LegendOptions;

  get legend() {
    return this.config?.legend ?? false;
  }
  get legendTitle() {
    return this.config?.legendTitle ?? 'Legend';
  }
  get legendPosition() {
    return this.config?.legendPosition ?? LegendPosition.Right;
  }
  get min() {
    return this.config?.min ?? 0;
  }
  get max() {
    return this.config?.max ?? 100;
  }
  get textValue() {
    return this.config?.textValue;
  }
  get units() {
    return this.config?.units;
  }
  get bigSegments() {
    return this.config?.bigSegments ?? 10;
  }
  get smallSegments() {
    return this.config?.smallSegments ?? 5;
  }
  get showAxis() {
    return this.config?.showAxis ?? true;
  }
  get startAngle() {
    return this.config?.startAngle ?? -120;
  }
  get angleSpan() {
    return this.config?.angleSpan ?? 240;
  }
  @Input()
  get activeEntries() {
    return this.config?.activeEntries ?? [];
  }
  set activeEntries(value: unknown[]) {
    if (this.config) this.config.activeEntries = value;
  }
  get axisTickFormatting() {
    return this.config?.axisTickFormatting;
  }
  get tooltipDisabled() {
    return this.config?.tooltipDisabled ?? false;
  }
  get valueFormatting() {
    return this.config?.valueFormatting;
  }
  get showText() {
    return this.config?.showText ?? true;
  }
  get margin() {
    return this.config?.margin;
  }

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
  ngAfterViewInit(): void {
    super.ngAfterViewInit();
    setTimeout(() => this.scaleText());
  }

  update(): void {
    super.update();
    if (!this.margin)
      this.config = { ...this.config, margin: this.showAxis ? [60, 100, 60, 100] : [10, 20, 10, 20] } as any;
    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showLegend: this.legend,
      legendPosition: this.legendPosition
    });
    this.domain = this.results.map(d => d.name);
    this.valueDomain = getGaugeValueDomain(this.results, this.min, this.max);
    this.valueScale = scaleLinear()
      .range([0, Math.min(this.angleSpan, 360)])
      .nice()
      .domain(this.valueDomain);
    this.displayValue = getGaugeDisplayValue(this.results, this.textValue, this.valueFormatting);
    this.outerRadius = Math.min(this.dims.width, this.dims.height) / 2;
    this.arcs = getGaugeArcs(this.results, this.outerRadius, Math.min(this.angleSpan, 360), this.valueScale, this.max);
    this.cornerRadius = Math.floor((Math.min((this.outerRadius * 0.7) / this.results.length, 10) * 0.7) / 2);
    this.textRadius =
      this.outerRadius - this.results.length * Math.min((this.outerRadius * 0.7) / this.results.length, 10);
    this.colors = new ColorHelper(this.scheme, ScaleType.Ordinal, this.domain as string[], this.customColors);
    this.legendOptions = {
      scaleType: ScaleType.Ordinal,
      colors: this.colors,
      domain: this.domain,
      title: this.legendTitle,
      position: this.legendPosition
    };
    this.transform = `translate(${this.margin[3] + this.dims.width / 2}, ${this.margin[0] + this.dims.height / 2})`;
    this.rotation = `rotate(${this.startAngle < 0 ? (this.startAngle % 360) + 360 : this.startAngle})`;
    setTimeout(() => this.scaleText(), 50);
  }

  scaleText(repeat: boolean = true): void {
    if (!this.showText || !this.textEl) return;
    const { width } = this.textEl.nativeElement.getBoundingClientRect();
    const oldScale = this.resizeScale;
    this.resizeScale = width === 0 ? 1 : Math.floor((this.textRadius / (width / this.resizeScale)) * 100) / 100;
    if (this.resizeScale !== oldScale) {
      this.textTransform = `scale(${this.resizeScale}, ${this.resizeScale})`;
      this.cd.markForCheck();
      if (repeat) setTimeout(() => this.scaleText(false), 50);
    }
  }

  onClick(data): void {
    this.select.emit(data);
  }
  onActivate(item): void {
    const idx = (this.activeEntries as unknown as { name: string; value: unknown; series: unknown }[]).findIndex(
      d => d.name === item.name && d.value === item.value
    );
    if (idx === -1) {
      this.activeEntries = [item, ...this.activeEntries];
      this.activate.emit({ value: item, entries: this.activeEntries });
    }
  }
  onDeactivate(item): void {
    const idx = (this.activeEntries as unknown as { name: string; value: unknown; series: unknown }[]).findIndex(
      d => d.name === item.name && d.value === item.value
    );
    if (idx > -1) {
      this.activeEntries.splice(idx, 1);
      this.activeEntries = [...this.activeEntries];
      this.deactivate.emit({ value: item, entries: this.activeEntries });
    }
  }
  isActive(entry): boolean {
    return this.activeEntries
      ? (this.activeEntries as unknown as { name: string; series: unknown }[]).some(
        d => entry.name === d.name && entry.series === d.series
      )
      : false;
  }
  trackBy(index: number, item: Arcs): any {
    return item.valueArc.data.name;
  }
}
