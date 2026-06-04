import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Importação das rotas e do componente principal
import { FolderPageRoutingModule } from './folder-routing.module';
import { FolderPage } from './folder.page';

/**
 * Módulo principal (Feature Module) da aplicação.
 * Agrega os módulos necessários para o funcionamento dos formulários,
 * navegação e componentes visuais da Agenda Académica.
 */
@NgModule({
  imports: [
    CommonModule,          // Diretivas comuns do Angular (ngIf, ngFor)
    FormsModule,           // Suporte para formulários baseados em template (ngModel)
    ReactiveFormsModule,   // Suporte para formulários reativos (FormBuilder, FormGroup)
    IonicModule,           // Componentes de interface do Ionic (ion-content, ion-modal, etc.)
    FolderPageRoutingModule // Configuração de rotas associada
  ],
  declarations: [
    FolderPage             // Componente da página principal da Agenda
  ]
})
export class FolderPageModule {}