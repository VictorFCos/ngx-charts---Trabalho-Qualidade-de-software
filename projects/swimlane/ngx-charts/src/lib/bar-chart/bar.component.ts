import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { select } from 'd3-selection';
import { id } from '../utils/id';
import { DataItem } from '../models/chart-data.model';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { Gradient } from '../common/types/gradient.interface';
import { getBarRadius, getBarEdges, getBarPath, getBarStartingPath, getBarGradient, shouldHideBar } from './bar.helper';

@Component({
  selector: 'g[ngx-charts-bar]',
  template: `
    <svg:defs *ngIf="hasGradient">
      <svg:g ngx-charts-svg-linear-gradient [orientation]="orientation" [name]="gradientId" [stops]="gradientStops" />
    </svg:defs>
    <svg:path
      class="bar"
      stroke="none"
      role="img"
      tabIndex="-1"
      [class.active]="isActive"
      [class.hidden]="hideBar"
      [attr.d]="path"
      [attr.aria-label]="ariaLabel"
      [attr.fill]="hasGradient ? gradientFill : fill"
      (click)="select.emit(data)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class BarComponent implements OnChanges {
  @Input() fill: string;
  @Input() data: DataItem;
  @Input() width: number;
  @Input() height: number;
  @Input() x: number;
  @Input() y: number;
  @Input() orientation: BarOrientation;
  @Input() roundEdges: boolean = true;
  @Input() gradient: boolean = false;
  @Input() offset: number = 0;
  @Input() isActive: boolean = false;
  @Input() stops: Gradient[];
  @Input() animations: boolean = true;
  @Input() ariaLabel: string;
  @Input() noBarWhenZero: boolean = true;

  @Output() select: EventEmitter<DataItem> = new EventEmitter();
  @Output() activate: EventEmitter<DataItem> = new EventEmitter();
  @Output() deactivate: EventEmitter<DataItem> = new EventEmitter();

  element: HTMLElement;
  path: string;
  gradientId: string;
  gradientFill: string;
  gradientStops: Gradient[];
  hasGradient: boolean = false;
  hideBar: boolean = false;

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.roundEdges) {
      this.loadAnimation();
    }
    this.update();
  }

  update(): void {
    this.gradientId = 'grad' + id().toString();
    this.gradientFill = `url(#${this.gradientId})`;

    if (this.gradient || this.stops) {
      this.gradientStops = getBarGradient(this.fill, this.stops, this.roundEdges ? 0.2 : 0.5);
      this.hasGradient = true;
    } else {
      this.hasGradient = false;
    }

    this.updatePathEl();
    this.hideBar = shouldHideBar(this.noBarWhenZero, this.orientation, this.width, this.height);
  }
  loadAnimation(): void {
    this.path = getBarStartingPath(
      this.x,
      this.y,
      this.width,
      this.height,
      getBarRadius(this.roundEdges, this.height, this.width),
      this.roundEdges,
      this.orientation,
      getBarEdges(this.roundEdges, this.orientation, this.data.value)
    );
    setTimeout(this.update.bind(this), 100);
  }

  updatePathEl(): void {
    const node = select(this.element).select('.bar');
    const path = getBarPath(
      this.x,
      this.y,
      this.width,
      this.height,
      getBarRadius(this.roundEdges, this.height, this.width),
      this.roundEdges,
      this.orientation,
      getBarEdges(this.roundEdges, this.orientation, this.data.value)
    );
    if (this.animations) {
      node.transition().duration(500).attr('d', path);
    } else {
      node.attr('d', path);
    }
  }
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.activate.emit(this.data);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.deactivate.emit(this.data);
  }
}
