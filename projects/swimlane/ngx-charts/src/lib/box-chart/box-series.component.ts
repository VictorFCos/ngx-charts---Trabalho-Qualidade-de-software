import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { IBoxModel, BoxChartSeries } from '../models/chart-data.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { StyleTypes } from '../common/tooltip/style.type';
import { PlacementTypes } from '../common/tooltip/position';
import { BoxSeriesConfig, getBoxModel } from './box-series.helper';

@Component({
  selector: 'g[ngx-charts-box-series]',
  templateUrl: './box-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ],
  standalone: false
})
export class BoxSeriesComponent implements OnChanges {
  @Input() config: BoxSeriesConfig;
  @Input() series: BoxChartSeries;

  @Output() select: EventEmitter<IBoxModel> = new EventEmitter();
  @Output() activate: EventEmitter<IBoxModel> = new EventEmitter();
  @Output() deactivate: EventEmitter<IBoxModel> = new EventEmitter();

  box: IBoxModel;
  tooltipTitle: string;

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  onClick(data: IBoxModel): void {
    this.select.emit(data);
  }

  update(): void {
    this.updateTooltipSettings();
    const result = getBoxModel(this.series, this.config);
    this.box = result.box;
    this.tooltipTitle = result.tooltipTitle;
  }

  updateTooltipSettings() {
    if (this.config.tooltipDisabled) {
      this.config.tooltipPlacement = undefined;
      this.config.tooltipType = undefined;
    } else {
      if (!this.config.tooltipPlacement) {
        this.config.tooltipPlacement = PlacementTypes.Top;
      }
      if (!this.config.tooltipType) {
        this.config.tooltipType = StyleTypes.tooltip;
      }
    }
  }
}
