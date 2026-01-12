import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { ColorHelper } from '../common/color.helper';
import { Gradient } from '../common/types/gradient.interface';
import { ScaleType } from '../common/types/scale-type.enum';
import { AreaChartSeries } from '../models/chart-data.model';
import { getAreaGenerators, sortAreaSeriesData, getAreaSeriesGradient } from './area-series.helper';

@Component({
  selector: 'g[ngx-charts-area-series]',
  template: `
    <svg:g
      ngx-charts-area
      class="area-series"
      [data]="data"
      [path]="path"
      [fill]="colors.getColor(data.name)"
      [stops]="gradientStops"
      [startingPath]="startingPath"
      [opacity]="opacity"
      [gradient]="gradient || hasGradient"
      [animations]="animations"
      [class.active]="isActive(data)"
      [class.inactive]="isInactive(data)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class AreaSeriesComponent implements OnChanges {
  @Input() data: AreaChartSeries;
  @Input() xScale: any;
  @Input() yScale: any;
  @Input() baseValue: any = 'auto';
  @Input() colors: ColorHelper;
  @Input() scaleType: ScaleType;
  @Input() stacked: boolean = false;
  @Input() normalized: boolean = false;
  @Input() gradient: boolean;
  @Input() curve: any;
  @Input() activeEntries: any[];
  @Input() animations: boolean = true;

  @Output() select = new EventEmitter();

  opacity: number;
  path: string;
  startingPath: string;

  hasGradient: boolean;
  gradientStops: Gradient[];

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update(): void {
    const { hasGradient, gradientStops } = getAreaSeriesGradient(this.colors, this.stacked, this.normalized, this.data.series);
    this.hasGradient = hasGradient;
    this.gradientStops = gradientStops;

    const { currentArea, startingArea } = getAreaGenerators(this.xScale, this.yScale, this.curve, this.stacked, this.normalized, this.baseValue);

    this.opacity = 0.8;
    const data = sortAreaSeriesData(this.data.series, this.scaleType, this.xScale);

    this.path = currentArea(data);
    this.startingPath = startingArea(data);
  }

  isActive(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name;
    });
    return item !== undefined;
  }

  isInactive(entry): boolean {
    if (!this.activeEntries || this.activeEntries.length === 0) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name;
    });
    return item === undefined;
  }
}

