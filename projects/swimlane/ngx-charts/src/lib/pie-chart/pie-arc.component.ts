import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { select } from 'd3-selection';
import { id } from '../utils/id';
import { DataItem } from '../models/chart-data.model';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { calculatePieArcPath, animatePieArc } from './pie-arc.helper';

@Component({
  selector: 'g[ngx-charts-pie-arc]',
  template: `
    <svg:g class="arc-group">
      <svg:defs *ngIf="gradient">
        <svg:g ngx-charts-svg-radial-gradient [color]="fill" [name]="radialGradientId" [startOpacity]="startOpacity" />
      </svg:defs>
      <svg:path
        [attr.d]="path"
        class="arc"
        [class.active]="isActive"
        [attr.fill]="getGradient()"
        (click)="onClick()"
        (dblclick)="onDblClick($event)"
        (mouseenter)="activate.emit(data)"
        (mouseleave)="deactivate.emit(data)"
        [style.pointer-events]="getPointerEvents()"
      />
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PieArcComponent implements OnChanges {
  @Input() fill: string;
  @Input() startAngle: number = 0;
  @Input() endAngle: number = Math.PI * 2;
  @Input() innerRadius: number;
  @Input() outerRadius: number;
  @Input() cornerRadius: number = 0;
  @Input() value: number;
  @Input() max: number;
  @Input() data: DataItem;
  @Input() explodeSlices: boolean = false;
  @Input() gradient: boolean = false;
  @Input() animate: boolean = true;
  @Input() pointerEvents: boolean = true;
  @Input() isActive: boolean = false;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @Output() dblclick = new EventEmitter();

  barOrientation = BarOrientation;

  element: HTMLElement;
  path: any;
  startOpacity: number;
  radialGradientId: string;
  gradientFill: string;
  initialized: boolean = false;

  private _timeout;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  getGradient(): string {
    return this.gradient ? this.gradientFill : this.fill;
  }

  getPointerEvents(): string {
    return this.pointerEvents ? 'auto' : 'none';
  }

  update(): void {
    this.startOpacity = 0.5;
    this.radialGradientId = 'linearGrad' + id().toString();
    this.gradientFill = `url(#${this.radialGradientId})`;

    if (this.animate) {
      animatePieArc(
        this.element,
        this.startAngle,
        this.endAngle,
        this.innerRadius,
        this.outerRadius,
        this.max,
        this.value,
        this.cornerRadius,
        this.explodeSlices,
        this.initialized,
        select(this.element).selectAll('.arc').data([{ startAngle: this.startAngle, endAngle: this.endAngle }])
      );
      this.initialized = true;
    } else {
      this.path = calculatePieArcPath(this.innerRadius, this.outerRadius, this.max, this.value, this.cornerRadius, this.explodeSlices).startAngle(this.startAngle).endAngle(this.endAngle)();
    }
  }

  onClick(): void {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.select.emit(this.data), 200);
  }

  onDblClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this._timeout);

    this.dblclick.emit({
      data: this.data,
      nativeEvent: event
    });
  }
}


