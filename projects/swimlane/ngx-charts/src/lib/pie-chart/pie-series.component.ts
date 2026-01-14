import {
  Component,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ChangeDetectionStrategy,
  TemplateRef
} from '@angular/core';
import { max } from 'd3-array';
import { arc, pie } from 'd3-shape';
import { ColorHelper } from '../common/color.helper';

import { formatLabel, escapeLabel } from '../common/label.helper';
import { DataItem } from '../models/chart-data.model';
import { PieData, calculateLabelPositions, isLabelVisible } from './pie-label.helper';
import { PlacementTypes } from '../common/tooltip/position';
import { StyleTypes } from '../common/tooltip/style.type';
import { ViewDimensions } from '../common/types/view-dimension.interface';

@Component({
  selector: 'g[ngx-charts-pie-series]',
  template: `
    <svg:g *ngFor="let arc of data; trackBy: trackBy">
      <svg:g
        ngx-charts-pie-label
        *ngIf="labelVisible(arc)"
        [config]="{
          data: arc,
          radius: outerRadius,
          color: color(arc),
          label: labelText(arc),
          labelTrim: trimLabels,
          labelTrimSize: maxLabelLength,
          max: max,
          value: arc.value,
          explodeSlices: explodeSlices,
          animations: animations
        }"
      ></svg:g>
      <svg:g
        ngx-charts-pie-arc
        [config]="{
          startAngle: arc.startAngle,
          endAngle: arc.endAngle,
          innerRadius: innerRadius,
          outerRadius: outerRadius,
          fill: color(arc),
          value: arc.data.value,
          gradient: gradient,
          data: arc.data,
          max: max,
          explodeSlices: explodeSlices,
          isActive: isActive(arc.data),
          animate: animations,
          pointerEvents: true,
          cornerRadius: 0
        }"
        (select)="onClick($event)"
        (activate)="activate.emit($event)"
        (deactivate)="deactivate.emit($event)"
        (dblclick)="dblclick.emit($event)"
        ngx-tooltip
        [tooltipDisabled]="tooltipDisabled"
        [tooltipPlacement]="placementTypes.Top"
        [tooltipType]="styleTypes.tooltip"
        [tooltipTitle]="getTooltipTitle(arc)"
        [tooltipTemplate]="tooltipTemplate"
        [tooltipContext]="arc.data"
      ></svg:g>
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PieSeriesComponent implements OnChanges {
  @Input() colors: ColorHelper;
  @Input() series: DataItem[] = [];
  @Input() dims: ViewDimensions;
  @Input() innerRadius: number = 60;
  @Input() outerRadius: number = 80;
  @Input() explodeSlices: boolean;
  @Input() showLabels: boolean;
  @Input() gradient: boolean;
  @Input() activeEntries: any[];
  @Input() labelFormatting: any;
  @Input() trimLabels: boolean = true;
  @Input() maxLabelLength: number = 10;
  @Input() tooltipText: (o: any) => any;
  @Input() tooltipDisabled: boolean = false;
  @Input() tooltipTemplate: TemplateRef<any>;
  @Input() animations: boolean = true;

  @Output() select = new EventEmitter();
  @Output() activate = new EventEmitter();
  @Output() deactivate = new EventEmitter();
  @Output() dblclick = new EventEmitter();

  max: number;
  data: PieData[];

  placementTypes = PlacementTypes;
  styleTypes = StyleTypes;

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    for (const propName in changes) {
      if (propName === 'activeEntries') {
        const current = changes[propName].currentValue;
        const previous = changes[propName].previousValue;
        if (!this.areActiveEntriesEqual(previous, current)) {
          shouldUpdate = true;
        }
      } else {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      this.update();
    }
  }

  areActiveEntriesEqual(prev: any[], curr: any[]): boolean {
    if (prev === curr) return true;
    if (!prev || !curr) return false;
    if (prev.length !== curr.length) return false;
    if (prev.length === 0 && curr.length === 0) return true;
    return prev.every((v, i) => v === curr[i]);
  }

  update(): void {
    const pieGenerator = pie<any, any>()
      .value(d => d.value)
      .sort(null);

    const arcData = pieGenerator(this.series);

    this.max = max(arcData, d => {
      return d.value;
    });

    this.data = calculateLabelPositions(arcData, this.outerRadius, this.showLabels);
    this.tooltipText = this.tooltipText || this.defaultTooltipText;
  }



  labelVisible(myArc): boolean {
    return isLabelVisible(myArc, this.showLabels);
  }

  getTooltipTitle(a) {
    return this.tooltipTemplate ? undefined : this.tooltipText(a);
  }

  labelText(myArc): string {
    if (this.labelFormatting) {
      return this.labelFormatting(myArc.data.name);
    }
    return this.label(myArc);
  }

  label(myArc): string {
    return formatLabel(myArc.data.name);
  }

  defaultTooltipText(myArc): string {
    const label = this.label(myArc);
    const val = formatLabel(myArc.data.value);

    return `
      <span class="tooltip-label">${escapeLabel(label)}</span>
      <span class="tooltip-val">${val}</span>
    `;
  }

  color(myArc): any {
    return this.colors.getColor(this.label(myArc));
  }

  trackBy(index, item): string {
    return item.data.name;
  }

  onClick(data): void {
    this.select.emit(data);
  }

  isActive(entry): boolean {
    if (!this.activeEntries) return false;
    const item = this.activeEntries.find(d => {
      return entry.name === d.name && entry.series === d.series;
    });
    return item !== undefined;
  }
}