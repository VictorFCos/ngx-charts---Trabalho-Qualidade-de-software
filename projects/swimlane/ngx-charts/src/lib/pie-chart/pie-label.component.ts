import { isPlatformServer } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  Inject
} from '@angular/core';

import { trimLabel } from '../common/trim-label.helper';
import { TextAnchor } from '../common/types/text-anchor.enum';
import { PieLabelConfig, calculateLine, getTextAnchor, hasPieLabelConfigChanged } from './pie-label.helper';

@Component({
  selector: 'g[ngx-charts-pie-label]',
  templateUrl: './pie-label.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PieLabelComponent implements OnChanges {
  @Input() config: PieLabelConfig;

  trimLabel: (label: string, max?: number) => string;
  line: string;
  styleTransform: string;
  attrTransform: string;
  textTransition: string;

  // Getters for template compatibility
  get label() { return this.config.label; }
  get labelTrim() { return this.config.labelTrim; }
  get labelTrimSize() { return this.config.labelTrimSize; }
  get animations() { return this.config.animations; }
  get color() { return this.config.color; }

  constructor(@Inject(PLATFORM_ID) public platformId: any) {
    this.trimLabel = trimLabel;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config) {
      const prev = changes.config.previousValue;
      const curr = changes.config.currentValue;
      if (hasPieLabelConfigChanged(prev, curr)) {
        this.setTransforms();
        this.update();
      }
    }
  }

  setTransforms() {
    const textX = this.config.data.pos[0];
    const textY = this.config.data.pos[1];

    if (isPlatformServer(this.platformId)) {
      this.styleTransform = `translate3d(${textX}px,${textY}px, 0)`;
      this.attrTransform = `translate(${textX},${textY})`;
      this.textTransition = !this.config.animations ? null : 'transform 0.75s';
    } else {
      const isIE = /(edge|msie|trident)/i.test(navigator.userAgent);
      this.styleTransform = isIE ? null : `translate3d(${textX}px,${textY}px, 0)`;
      this.attrTransform = !isIE ? null : `translate(${textX},${textY})`;
      this.textTransition = isIE || !this.config.animations ? null : 'transform 0.75s';
    }
  }

  update(): void {
    this.line = calculateLine(
      this.config.data,
      this.config.radius,
      this.config.max,
      this.config.value,
      this.config.explodeSlices
    );
  }

  textAnchor(): TextAnchor {
    return getTextAnchor(this.config.data);
  }
}
