import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalheGrupoPage } from './detalhe-grupo.page';

// Configuração das rotas específicas para a página de detalhes do grupo
const routes: Routes = [
  {
    // O caminho base carrega imediatamente o componente DetalheGrupoPage
    path: '',
    component: DetalheGrupoPage
  }
];

@NgModule({
  // Regista as rotas filhas exclusivas para este módulo
  imports: [RouterModule.forChild(routes)],
  // Exporta o RouterModule para que as rotas sejam reconhecidas pela aplicação principal
  exports: [RouterModule],
})
export class DetalheGrupoPageRoutingModule {}
