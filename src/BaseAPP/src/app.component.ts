import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlowRunnerModalComponent } from './components/flow-runner-modal/flow-runner-modal.component';
import { BackofficeComponent } from './components/backoffice/backoffice.component';
import { CertificatesDashboardComponent } from './components/certificates-dashboard/certificates-dashboard.component';
import { Flow } from './models/flow.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FlowRunnerModalComponent, BackofficeComponent, CertificatesDashboardComponent],
})
export class AppComponent {
  activeModule = signal<'certificates' | 'backoffice'>('certificates');

  isModalOpen = signal(false);
  selectedFlow = signal<Flow | null>(null);

  runFlow(flow: Flow) {
    this.selectedFlow.set(flow);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedFlow.set(null);
  }
}