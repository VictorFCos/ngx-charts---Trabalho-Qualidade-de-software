import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { getGaugeTickAnchor, getGaugeTickPath } from './gauge-axis.helper';

interface Big {
  line: string;
  text: string;
  textAnchor: string;
  textTransform: string;
}

interface Ticks {
  big: Big[];
  small: Array<{ line: string }>;
}

@Component({
  selector: 'g[ngx-charts-gauge-axis]',
  template: `
    <svg:g [attr.transform]="rotate">
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
      <svg:g *ngFor="let tick of ticks.big" class="gauge-tick gauge-tick-large">
        <svg:text
          [style.textAnchor]="tick.textAnchor"
          [attr.transform]="tick.textTransform"
          alignment-baseline="central"
        >
          {{ tick.text }}
        </svg:text>
      </svg:g>
      <svg:g *ngFor="let tick of ticks.small" class="gauge-tick gauge-tick-small">
        <svg:path [attr.d]="tick.line" />
      </svg:g>
    </svg:g>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class GaugeAxisComponent implements OnChanges {
  @Input() bigSegments: number;
  @Input() smallSegments: number;
  @Input() min: number;
  @Input() max: number;
  @Input() angleSpan: number;
  @Input() startAngle: number;
  @Input() radius: number;
  @Input() valueScale: any;
  @Input() tickFormatting: any;

  ticks: Ticks;
  rotationAngle: number;
  rotate: string = '';

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  update(): void {
    this.rotationAngle = -90 + this.startAngle;
    this.rotate = `rotate(${this.rotationAngle})`;
    this.ticks = this.getTicks();
  }

  getTicks(): Ticks {
    const bigTickSegment = this.angleSpan / this.bigSegments;
    const smallTickSegment = bigTickSegment / this.smallSegments;
    const tickLength = 20;
    const ticks = { big: [], small: [] };
    const startDistance = this.radius + 10;
    const textDist = startDistance + tickLength + 10;

    for (let i = 0; i <= this.bigSegments; i++) {
      const angleDeg = i * bigTickSegment;
      const angle = (angleDeg * Math.PI) / 180;

      if (!(i === 0 && this.angleSpan === 360)) {
        let text = Number.parseFloat(this.valueScale.invert(angleDeg).toString()).toLocaleString();
        if (this.tickFormatting) text = this.tickFormatting(text);
        ticks.big.push({
          line: getGaugeTickPath(startDistance, tickLength, angle),
          textAnchor: getGaugeTickAnchor(angleDeg, this.startAngle),
          text,
          textTransform: `translate(${textDist * Math.cos(angle)}, ${textDist * Math.sin(angle)}) rotate(${-this.rotationAngle})`
        });
      }

      if (i === this.bigSegments) continue;

      for (let j = 1; j <= this.smallSegments; j++) {
        const smallAngle = ((angleDeg + j * smallTickSegment) * Math.PI) / 180;
        ticks.small.push({ line: getGaugeTickPath(startDistance, tickLength / 2, smallAngle) });
      }
    }
    return ticks;
  }
}

