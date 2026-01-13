import {
  Component,
  OnChanges,
  Input,
  Output,
  SimpleChanges,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef
} from '@angular/core';
import { ColorHelper } from '../common/color.helper';
import { escapeLabel } from '../common/label.helper';
import { StyleTypes } from '../common/tooltip/style.type';
import { PlacementTypes } from '../common/tooltip/position';
import { ViewDimensions } from '../common/types/view-dimension.interface';
import { TreeMapCellConfig } from './tree-map.helper';

@Component({
  selector: 'g[ngx-charts-tree-map-cell-series]',
  template: `
    <svg:g
      ngx-charts-tree-map-cell
      *ngFor="let c of cells; trackBy: trackBy"
      [config]="c"
      (select)="onClick($event)"
      ngx-tooltip
      [tooltipDisabled]="tooltipDisabled"
      [tooltipPlacement]="placementTypes.Top"
      [tooltipType]="styleTypes.tooltip"
      [tooltipTitle]="tooltipTemplate ? undefined : getTooltipText(c)"
      [tooltipTemplate]="tooltipTemplate"
      [tooltipContext]="c.data"
    ></svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TreeMapCellSeriesComponent implements OnChanges {
  @Input() data: { children: any[] };
  @Input() dims: ViewDimensions;
  @Input() colors: ColorHelper;
  @Input() valueFormatting?: (value: any) => string;
  @Input() labelFormatting?: (cell: any) => string;
  @Input() gradient: boolean = false;
  @Input() tooltipDisabled: boolean = false;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() animations: boolean = true;

  @Output() select = new EventEmitter();

  cells: TreeMapCellConfig[];
  styleTypes = StyleTypes;
  placementTypes = PlacementTypes;

  ngOnChanges(changes: SimpleChanges): void {
    this.cells = this.getCells();
  }

  getCells(): TreeMapCellConfig[] {
    return this.data.children
      .filter(d => {
        return d.depth === 1;
      })
      .map((d, index) => {
        const label = d.id;

        return {
          data: d.data,
          x: d.x0,
          y: d.y0,
          width: d.x1 - d.x0,
          height: d.y1 - d.y0,
          fill: this.colors.getColor(label),
          label,
          value: d.value,
          valueFormatting: this.valueFormatting,
          labelFormatting: this.labelFormatting,
          gradient: this.gradient,
          animations: this.animations
        };
      });
  }

  getTooltipText({ label, value }: { label: string; value: number }): string {
    return `
      <span class="tooltip-label">${escapeLabel(label)}</span>
      <span class="tooltip-val">${value.toLocaleString()}</span>
    `;
  }

  onClick(data): void {
    this.select.emit(data);
  }

  trackBy(index, item): string {
    return item.label;
  }
}