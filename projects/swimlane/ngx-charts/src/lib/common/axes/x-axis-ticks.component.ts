import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ElementRef,
  ViewChild,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { TextAnchor } from '../types/text-anchor.enum';
import {
  getXAxisHeight,
  updateXAxisTicks,
  XAxisTicksConfig,
  getXAxisTickChunks
} from './x-axis.helper';

@Component({
  selector: 'g[ngx-charts-x-axis-ticks]',
  templateUrl: './x-axis-ticks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class XAxisTicksComponent implements OnChanges, AfterViewInit {
  @Input() config: XAxisTicksConfig;
  @Output() dimensionsChanged = new EventEmitter();

  verticalSpacing: number = 20;
  innerTickSize: number = 6;
  tickPadding: number = 3;
  textAnchor: TextAnchor = TextAnchor.Middle;
  maxAllowedLength: number = 16;
  adjustedScale: any;
  textTransform: string;
  ticks: any[];
  tickFormat: (o: any) => any;
  height: number = 0;
  approxHeight: number = 10;
  maxPossibleLengthForTickIfWrapped = 16;
  transform: (o: any) => string;
  refMax: number;
  refMin: number;
  referenceLineLength: number = 0;
  referenceAreaPath: string;
  tickSpacing: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  dx: string;
  dy: string;

  @ViewChild('ticksel') ticksElement: ElementRef;

  get isWrapTicksSupported() {
    return this.config.wrapTicks && this.config.scale.step;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      this.update();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateDims());
  }

  updateDims(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.dimensionsChanged.emit({ height: this.approxHeight });
      return;
    }
    const height = getXAxisHeight(this.ticksElement);
    if (height !== this.height) {
      this.height = height;
      this.dimensionsChanged.emit({ height: this.height });
      setTimeout(() => this.updateDims());
    }
  }

  update(): void {
    updateXAxisTicks(this);
    setTimeout(() => this.updateDims());
  }

  tickTransform(tick: number): string {
    return 'translate(' + this.adjustedScale(tick) + ',' + this.verticalSpacing + ')';
  }
  gridLineTransform(): string {
    return `translate(0, ${- this.verticalSpacing - 5})`;
  }
  tickTrim(label: string): string {
    return this.config.trimTicks ? trimLabel(label, this.config.maxTickLength) : label;
  }
  tickChunks(label: string): string[] {
    return getXAxisTickChunks(
      label,
      this.config.maxTickLength,
      this.config.scale.bandwidth ? this.config.scale.bandwidth() : 0,
      this.config.rotateTicks,
      this.config.scale.step ? this.config.scale.step() : 0,
      this.tickTrim.bind(this),
      this.maxPossibleLengthForTickIfWrapped,
      isPlatformBrowser(this.platformId),
      this.approxHeight
    );
  }
}