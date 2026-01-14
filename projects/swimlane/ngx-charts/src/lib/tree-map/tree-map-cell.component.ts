import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { invertColor } from '../utils/color-utils';
import { id } from '../utils/id';
import { Gradient } from '../common/types/gradient.interface';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import {
  getTreeMapCellGradientStops,
  getTreeMapCellFormattedValue,
  getTreeMapCellFormattedLabel,
  updateTreeMapCell,
  TreeMapCellConfig
} from './tree-map.helper';

@Component({
  selector: 'g[ngx-charts-tree-map-cell]',
  templateUrl: './tree-map-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TreeMapCellComponent implements OnChanges {
  @Input() config: TreeMapCellConfig;
  @Output() select = new EventEmitter();

  gradientStops: Gradient[];
  gradientId: string;
  gradientUrl: string;
  element: HTMLElement;
  formattedLabel: string;
  formattedValue: string;
  initialized: boolean = false;
  orientation = BarOrientation;

  // Added getters to maintain compatibility with the extracted template
  get data() { return this.config.data; }
  get fill() { return this.config.fill; }
  get x() { return this.config.x; }
  get y() { return this.config.y; }
  get width() { return this.config.width; }
  get height() { return this.config.height; }
  get label() { return this.config.label; }
  get value() { return this.config.value; }
  get valueFormatting() { return this.config.valueFormatting; }
  get gradient() { return this.config.gradient; }
  get animations() { return this.config.animations; }

  constructor(element: ElementRef) {
    this.element = element.nativeElement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      updateTreeMapCell(this);
      this.formattedValue = getTreeMapCellFormattedValue(this.config.value, this.config.valueFormatting);
      this.formattedLabel = getTreeMapCellFormattedLabel(this.config.label, this.config.labelFormatting, this.config.data, this.config.value);

      if (!this.initialized) {
        this.gradientId = 'grad' + id().toString();
        this.gradientUrl = `url(#${this.gradientId})`;
        this.gradientStops = getTreeMapCellGradientStops(this.config.fill);
        this.initialized = true;
      } else if (changes.config.currentValue.fill !== changes.config.previousValue?.fill) {
        this.gradientStops = getTreeMapCellGradientStops(this.config.fill);
      }
    }
  }

  getTextColor(): string {
    return invertColor(this.config.fill);
  }
  onClick(): void {
    this.select.emit(this.config.data);
  }
}