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
import { calculatePieArcPath, animatePieArc, PieArcConfig, hasPieArcConfigChanged } from './pie-arc.helper';

@Component({
  selector: 'g[ngx-charts-pie-arc]',
  templateUrl: './pie-arc.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PieArcComponent implements OnChanges {
  @Input() config: PieArcConfig;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @Output() dblclick = new EventEmitter();

  element: HTMLElement;
  path: any;
  startOpacity: number;
  radialGradientId: string;
  gradientFill: string;
  initialized: boolean = false;

  private _timeout;

  // Getters for template compatibility
  get fill() { return this.config.fill; }
  get startAngle() { return this.config.startAngle; }
  get endAngle() { return this.config.endAngle; }
  get innerRadius() { return this.config.innerRadius; }
  get outerRadius() { return this.config.outerRadius; }
  get cornerRadius() { return this.config.cornerRadius; }
  get value() { return this.config.value; }
  get max() { return this.config.max; }
  get data() { return this.config.data; }
  get explodeSlices() { return this.config.explodeSlices; }
  get gradient() { return this.config.gradient; }
  get animate() { return this.config.animate; }
  get pointerEvents() { return this.config.pointerEvents; }
  get isActive() { return this.config.isActive; }

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      const prev = changes.config.previousValue;
      const curr = changes.config.currentValue;
      if (hasPieArcConfigChanged(prev, curr)) {
        this.update();
      }
    }
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
        select(this.element)
          .selectAll('.arc')
          .data([{ startAngle: this.startAngle, endAngle: this.endAngle }])
      );
      this.initialized = true;
    } else {
      this.path = calculatePieArcPath(
        this.innerRadius,
        this.outerRadius,
        this.max,
        this.value,
        this.cornerRadius,
        this.explodeSlices
      )
        .startAngle(this.startAngle)
        .endAngle(this.endAngle)();
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