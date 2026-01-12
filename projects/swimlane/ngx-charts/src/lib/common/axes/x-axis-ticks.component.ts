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
import { Orientation } from '../types/orientation.enum';
import { TextAnchor } from '../types/text-anchor.enum';
import {
  getXAxisRotationAngle,
  getXAxisTicks,
  getXAxisTickChunks,
  setXAxisReferenceLines,
  getXAxisHeight,
  updateXAxisTicks
} from './x-axis.helper';

@Component({
  selector: 'g[ngx-charts-x-axis-ticks]',
  template: `
    <svg:g #ticksel>
      <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="tickTransform(tick)">
        <ng-container *ngIf="tickFormat(tick) as tickFormatted">
          <title>{{ tickFormatted }}</title>
          <svg:text
            stroke-width="0.01"
            font-size="12px"
            [attr.text-anchor]="textAnchor"
            [attr.transform]="textTransform"
          >
            <ng-container *ngIf="isWrapTicksSupported; then tmplMultilineTick; else tmplSinglelineTick"></ng-container>
          </svg:text>
          <ng-template #tmplMultilineTick>
            <ng-container *ngIf="tickChunks(tick) as tickLines">
              <svg:tspan *ngFor="let tickLine of tickLines; let i = index" x="0" [attr.y]="i * 12">
                {{ tickLine }}
              </svg:tspan>
            </ng-container>
          </ng-template>
          <ng-template #tmplSinglelineTick>{{ tickTrim(tickFormatted) }}</ng-template>
        </ng-container>
      </svg:g>
    </svg:g>
    <svg:g *ngFor="let tick of ticks" [attr.transform]="tickTransform(tick)">
      <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
        <svg:line class="gridline-path gridline-path-vertical" [attr.y1]="-gridLineHeight" y2="0" />
      </svg:g>
    </svg:g>
    <svg:path
      *ngIf="referenceLineLength > 1 && refMax && refMin && showRefLines"
      class="reference-area"
      [attr.d]="referenceAreaPath"
      [attr.transform]="gridLineTransform()"
    />
    <svg:g *ngFor="let refLine of referenceLines" class="ref-line">
      <svg:g *ngIf="showRefLines" [attr.transform]="transform(refLine.value)">
        <svg:line
          class="refline-path gridline-path-vertical"
          y1="25"
          [attr.y2]="25 + gridLineHeight"
          [attr.transform]="gridLineTransform()"
        />
        <svg:g *ngIf="showRefLabels">
          <title>{{ tickTrim(tickFormat(refLine.value)) }}</title>
          <svg:text class="refline-label" transform="rotate(-270) translate(5, -5)">{{ refLine.name }}</svg:text>
        </svg:g>
      </svg:g>
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class XAxisTicksComponent implements OnChanges, AfterViewInit {
  @Input() scale;
  @Input() orient: Orientation;
  @Input() tickArguments: number[] = [5];
  @Input() tickValues: any[];
  @Input() tickStroke: string = '#ccc';
  @Input() trimTicks: boolean = true;
  @Input() maxTickLength: number = 16;
  @Input() tickFormatting;
  @Input() showGridLines = false;
  @Input() gridLineHeight: number;
  @Input() width: number;
  @Input() rotateTicks: boolean = true;
  @Input() wrapTicks = false;
  @Input() referenceLines: any[];
  @Input() showRefLabels: boolean = false;
  @Input() showRefLines: boolean = false;
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

  @ViewChild('ticksel') ticksElement: ElementRef;

  get isWrapTicksSupported() {
    return this.wrapTicks && this.scale.step;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
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
    return `translate(0,${-this.verticalSpacing - 5})`;
  }
  tickTrim(label: string): string {
    return this.trimTicks ? trimLabel(label, this.maxTickLength) : label;
  }
  tickChunks(label: string): string[] {
    return getXAxisTickChunks(
      label,
      this.maxTickLength,
      this.scale.bandwidth ? this.scale.bandwidth() : 0,
      this.rotateTicks,
      this.scale.step ? this.scale.step() : 0,
      this.tickTrim.bind(this),
      this.maxPossibleLengthForTickIfWrapped,
      isPlatformBrowser(this.platformId),
      this.approxHeight
    );
  }
}
