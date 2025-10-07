import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowDesignerComponent } from '../flow-designer/flow-designer.component';
import { QueryDesignerComponent } from '../query-designer/query-designer.component';
import { FlowService } from '../../services/flow.service';
import { Flow } from '../../models/flow.model';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [CommonModule, FlowDesignerComponent, QueryDesignerComponent],
  templateUrl: './backoffice.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackofficeComponent {
  private flowService = inject(FlowService);

  flowGroups = this.flowService.flowGroups;
  
  designMode = signal(false);
  designerTab = signal<'flows' | 'queries'>('flows');

  runFlowRequest = output<Flow>();

  toggleDesignMode() {
    this.designMode.set(!this.designMode());
    if (this.designMode()) {
        this.designerTab.set('flows');
    }
  }
}
