import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowService } from '../../services/flow.service';
import { Flow, FlowGroup } from '../../models/flow.model';

@Component({
  selector: 'app-certificates-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificates-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificatesDashboardComponent {
  private flowService = inject(FlowService);

  runFlowRequest = output<Flow>();

  publishedFlowGroups = computed(() => {
    const allGroups = this.flowService.flowGroups();
    
    return allGroups
      .map(group => ({
        ...group,
        flows: group.flows.filter(flow => flow.availableInCertificates)
      }))
      .filter(group => group.flows.length > 0);
  });
}
