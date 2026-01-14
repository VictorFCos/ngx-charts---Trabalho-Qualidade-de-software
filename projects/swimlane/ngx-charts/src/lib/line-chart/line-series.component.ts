import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { BarOrientation } from '../common/types/bar-orientation.enum';
import { Gradient } from '../common/types/gradient.interface';
import { updateLineSeries, LineSeriesConfig, areActiveEntriesEqual, isActive, isInactive } from './line-series.helper';

@Component({
  selector: 'g[ngx-charts-line-series]',
  templateUrl: './line-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class LineSeriesComponent implements OnChanges {
  @Input() config: LineSeriesConfig;

  path: string;
  outerPath: string;
  areaPath: string;
  gradientId: string;
  gradientUrl: string;
  hasGradient: boolean;
  gradientStops: Gradient[];
  areaGradientStops: Gradient[];
  stroke: string;
  barOrientation = BarOrientation;

  // Getters for template compatibility
  get data() { return this.config.data; }
  get colors() { return this.config.colors; }
  get rangeFillOpacity() { return this.config.rangeFillOpacity; }
  get hasRange() { return this.config.hasRange; }
  get animations() { return this.config.animations; }

  ngOnChanges(changes: SimpleChanges): void {
    let shouldUpdate = false;

    if (changes.config) {
        // Simplified change detection for config object
        // ideally compare content or rely on immutable updates
        shouldUpdate = true;
    }

    // Fallback logic for activeEntries check inside config if needed, 
    // but simpler to just update on config change.
    
    if (changes.config && changes.config.currentValue && changes.config.previousValue) {
        const current = changes.config.currentValue.activeEntries;
        const previous = changes.config.previousValue.activeEntries;
        if (areActiveEntriesEqual(previous, current)) {
            // If only active entries changed and they are equal (deep check), maybe skip update?
            // But checking equality of other props is hard without individual inputs.
            // For now, update on any config change is safer.
        }
    }

    if (shouldUpdate) {
      this.update();
    }
  }

  update(): void {
    updateLineSeries(this);
  }

  isActive(entry): boolean {
    return isActive(this.config.activeEntries, entry);
  }

  isInactive(entry): boolean {
    return isInactive(this.config.activeEntries, entry);
  }
}