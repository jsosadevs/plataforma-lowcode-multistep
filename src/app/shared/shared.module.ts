import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material que probablemente se usarán
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

// Array de componentes a declarar (se llenará a medida que se creen)
const components: any[] = [];

// Array de módulos a importar y exportar
const modules: any[] = [
  CommonModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatDialogModule,
  MatSelectModule,
  MatTabsModule,
];

/**
 * Módulo para los componentes de UI reutilizables y otros elementos compartidos.
 */
@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...components,
    ...modules
  ]
})
export class SharedModule { }