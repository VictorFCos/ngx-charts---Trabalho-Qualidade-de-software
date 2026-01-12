import { Component, Input, Output, EventEmitter, ElementRef, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { invertColor } from '../utils/color-utils';
import { id } from '../utils/id';
import { DataItem } from '../models/chart-data.model';
import { Gradient } from '../common/types/gradient.interface';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { getTreeMapCellGradientStops, getTreeMapCellFormattedValue, getTreeMapCellFormattedLabel, updateTreeMapCell } from './tree-map.helper';

@Component({
  selector: 'g[ngx-charts-tree-map-cell]',
  template: `
    <svg:g>
      <defs *ngIf="gradient">
        <svg:g ngx-charts-svg-linear-gradient [orientation]="orientation.Vertical" [name]="gradientId" [stops]="gradientStops" />
      </defs>
      <svg:rect [attr.fill]="gradient ? gradientUrl : fill" [attr.width]="width" [attr.height]="height" [attr.x]="x" [attr.y]="y" class="cell" (click)="onClick()" />
      <svg:foreignObject *ngIf="width >= 70 && height >= 35" [attr.x]="x" [attr.y]="y" [attr.width]="width" [attr.height]="height" class="treemap-label" [style.pointer-events]="'none'">
        <xhtml:p [style.color]="getTextColor()" [style.height]="height + 'px'" [style.width]="width + 'px'">
          <xhtml:span class="treemap-label" [innerHTML]="formattedLabel"> </xhtml:span>
          <xhtml:br />
          <xhtml:span *ngIf="animations" class="treemap-val" ngx-charts-count-up [countTo]="value" [valueFormatting]="valueFormatting"></xhtml:span>
          <xhtml:span *ngIf="!animations" class="treemap-val">{{ formattedValue }}</xhtml:span>
        </xhtml:p>
      </svg:foreignObject>
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TreeMapCellComponent implements OnChanges {
  @Input() data: DataItem;
  @Input() fill: string;
  @Input() x: number;
  @Input() y: number;
  @Input() width: number;
  @Input() height: number;
  @Input() label: string;
  @Input() value: any;
  @Input() valueFormatting: any;
  @Input() labelFormatting: any;
  @Input() gradient: boolean = false;
  @Input() animations: boolean = true;
  @Output() select = new EventEmitter();

  gradientStops: Gradient[];
  gradientId: string;
  gradientUrl: string;
  element: HTMLElement;
  formattedLabel: string;
  formattedValue: string;
  initialized: boolean = false;
  orientation = BarOrientation;

  constructor(element: ElementRef) { this.element = element.nativeElement; }

  ngOnChanges(): void {
    updateTreeMapCell(this);
    this.formattedValue = getTreeMapCellFormattedValue(this.value, this.valueFormatting);
    this.formattedLabel = getTreeMapCellFormattedLabel(this.label, this.labelFormatting, this.data, this.value);
    this.gradientId = 'grad' + id().toString();
    this.gradientUrl = `url(#${this.gradientId})`;
    this.gradientStops = getTreeMapCellGradientStops(this.fill);
  }

  getTextColor(): string { return invertColor(this.fill); }
  onClick(): void { this.select.emit(this.data); }
}