import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  SimpleChanges
} from '@angular/core';
import { TooltipService } from '../tooltip/tooltip.service';
import { LegendOptions, LegendType, LegendPosition } from '../types/legend.model';
import { areActiveEntriesEqual, calculateWidths } from './chart.helper';

@Component({
  providers: [TooltipService],
  selector: 'ngx-charts-chart',
  templateUrl: './chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ChartComponent implements OnChanges {
  @Input() view: [number, number];
  @Input() showLegend: boolean = false;
  @Input() legendOptions: LegendOptions;
  @Input() legendType: LegendType;
  @Input() activeEntries: any[];
  @Input() animations: boolean = true;

  @Output() legendLabelClick = new EventEmitter<string>();
  @Output() legendLabelActivate = new EventEmitter<{ name: string }>();
  @Output() legendLabelDeactivate = new EventEmitter<{ name: string }>();

  chartWidth: number;
  title: string;
  legendWidth: number;

  readonly LegendPosition = LegendPosition;
  readonly LegendType = LegendType;

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    for (const propName in changes) {
      if (propName === 'activeEntries') {
        const current = changes[propName].currentValue;
        const previous = changes[propName].previousValue;
        if (!areActiveEntriesEqual(previous, current)) {
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

  update(): void {
    const result = calculateWidths(this.view, this.showLegend, this.legendOptions);
    this.chartWidth = result.chartWidth;
    this.legendWidth = result.legendWidth;
    this.legendType = result.legendType;
  }
}