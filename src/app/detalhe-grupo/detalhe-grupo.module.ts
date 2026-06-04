import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Importação do sistema de rotas específico desta página
import { DetalheGrupoPageRoutingModule } from './detalhe-grupo-routing.module';

// Importação do componente visual principal da página
import { DetalheGrupoPage } from './detalhe-grupo.page';

/**
 * Módulo responsável por agregar todas as dependências, 
 * componentes e rotas da página "Detalhes do Grupo".
 */
@NgModule({
  imports: [
    CommonModule,  // Fornece as diretivas estruturais básicas do Angular (ex: *ngIf, *ngFor)
    FormsModule,   // Permite a utilização de formulários e data binding (ex: [(ngModel)])
    IonicModule,   // Disponibiliza os componentes visuais nativos do Ionic (ex: ion-modal, ion-icon)
    DetalheGrupoPageRoutingModule // Injeta as regras de navegação definidas no ficheiro de routing
  ],
  declarations: [
    DetalheGrupoPage // Regista a classe principal da página para que possa ser renderizada
  ]
})
export class DetalheGrupoPageModule {}
