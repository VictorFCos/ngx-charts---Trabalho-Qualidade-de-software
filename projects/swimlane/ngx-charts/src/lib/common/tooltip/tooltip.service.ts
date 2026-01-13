import { Injectable, Type } from '@angular/core';
import { InjectionService } from './injection.service';
import { TooltipContentComponent } from './tooltip.component';
import { InjectionRegisteryService } from './injection-registery.service';
@Injectable()
export class TooltipService extends InjectionRegisteryService<TooltipContentComponent> {
  type: Type<TooltipContentComponent> = TooltipContentComponent;

  constructor(injectionService: InjectionService) {
    super(injectionService);
  }
}
