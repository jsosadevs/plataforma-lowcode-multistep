import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { UiDesignerService, UIDesignerState } from '../../services/ui-designer.service';
import { TemplateManagerService } from '../../services/template-manager.service';
import { Flow } from '../../models/flow.model';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-flow-ui-designer',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './flow-ui-designer.component.html',
  styleUrls: ['./flow-ui-designer.component.scss']
})
export class FlowUiDesignerComponent implements OnInit, OnDestroy {

  @Input() flow!: Flow; // El flujo de entrada para configurar

  public state!: UIDesignerState;
  private stateSubscription!: Subscription;

  constructor(
    private uiDesignerService: UiDesignerService,
    private templateManagerService: TemplateManagerService
  ) { }

  ngOnInit(): void {
    // Inicializar el estado del diseñador con el flujo de entrada
    if (this.flow) {
      this.uiDesignerService.initializeState(this.flow);
    }

    // Suscribirse a los cambios de estado del servicio
    this.stateSubscription = this.uiDesignerService.state$.subscribe(state => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción para evitar fugas de memoria
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  // Aquí irían los métodos para interactuar con los servicios,
  // por ejemplo, para cambiar la pestaña activa o aplicar una plantilla.

  public onTabChange(tab: string): void {
    this.uiDesignerService.setActiveTab(tab);
  }

  public onSaveChanges(): void {
    // Lógica para guardar el `state.localFlow`
    console.log('Guardando cambios:', this.state.localFlow);
  }

  public onResetChanges(): void {
    this.uiDesignerService.resetChanges();
  }
}