import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { invertColor } from '../utils/color-utils';
import { ColorHelper } from '../common/color.helper';
import { ViewDimensions } from '../common/types/view-dimension.interface';

export interface CardModel {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  tooltipText: string;
  textColor: string;
  bandColor: string;
  label: string;
  data: any;
}

@Component({
  selector: 'g[ngx-charts-card-series]',
  template: `
    <svg:rect
      *ngFor="let c of emptySlots; trackBy: trackBy"
      class="card-empty"
      [attr.x]="c.x"
      [attr.y]="c.y"
      [style.fill]="emptyColor"
      [attr.width]="c.width"
      [attr.height]="c.height"
      rx="3"
      ry="3"
    />
    <svg:g
      ngx-charts-card
      *ngFor="let c of cards; trackBy: trackBy"
      [x]="c.x"
      [y]="c.y"
      [width]="c.width"
      [height]="c.height"
      [color]="c.color"
      [bandColor]="c.bandColor"
      [textColor]="c.textColor"
      [data]="c.data"
      [label]="c.label"
      [medianSize]="medianSize"
      [valueFormatting]="valueFormatting"
      [labelFormatting]="labelFormatting"
      [animations]="animations"
      (select)="onClick($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CardSeriesComponent implements OnChanges {
  @Input() data: any[];
  @Input() dims: ViewDimensions;
  @Input() colors: ColorHelper;
  @Input() innerPadding: number = 15;
  @Input() cardColor: string;
  @Input() bandColor: string;
  @Input() emptyColor = 'rgba(0, 0, 0, 0)';
  @Input() textColor: string;
  @Input() valueFormatting: any;
  @Input() labelFormatting: any;
  @Input() animations: boolean = true;
  @Output() select = new EventEmitter();
  cards: CardModel[];
  emptySlots: any[];
  medianSize: number;

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }
  update(): void {
    if (this.data.length > 2) {
      const valFmt = this.valueFormatting || (card => card.value.toLocaleString());
      const sortedLengths = this.data
        .map(d =>
          d?.data && d.data.value !== undefined && d.data.value !== null
            ? valFmt({ data: d.data, label: d.data.name || '', value: d.data.value }).length
            : 0
        )
        .sort((a, b) => b - a);
      this.medianSize = sortedLengths[Math.ceil(this.data.length / 2)];
    }
    const yP = typeof this.innerPadding === 'number' ? this.innerPadding : this.innerPadding[0] + this.innerPadding[2];
    const xP = typeof this.innerPadding === 'number' ? this.innerPadding : this.innerPadding[1] + this.innerPadding[3];
    const allCards = this.data.map(d => {
      let label = d.data.name;
      label = label?.constructor.name === 'Date' ? label.toLocaleDateString() : label ? label.toLocaleString() : label;
      const valueColor = label ? this.colors.getColor(label) : this.emptyColor;
      const color = this.cardColor || valueColor || '#000';
      return {
        x: d.x,
        y: d.y,
        width: d.width - xP,
        height: d.height - yP,
        color,
        bandColor: this.bandColor || valueColor,
        textColor: this.textColor || invertColor(color),
        label,
        data: d.data,
        tooltipText: `${label}: ${d.data.value}`
      };
    });
    this.cards = allCards.filter(d => d.data.value !== null);
    this.emptySlots = allCards.filter(d => d.data.value === null);
  }
  trackBy(index, card): string {
    return card.label;
  }
  onClick(data): void {
    this.select.emit(data);
  }
}
