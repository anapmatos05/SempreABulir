import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importação do componente principal associado a este módulo de rotas
import { FolderPage } from './folder.page';

// Configuração das rotas específicas para a página principal (Folder/Abas)
const routes: Routes = [
  {
    // O caminho vazio ('') indica que este componente será carregado por defeito
    // quando o módulo for invocado pela navegação principal da aplicação
    path: '',
    component: FolderPage
  }
];

/**
 * Módulo de Encaminhamento (Routing) dedicado à FolderPage.
 * Isola as regras de navegação desta secção para manter a arquitetura modular.
 */
@NgModule({
  // Regista as rotas definidas acima como rotas filhas (Feature Module)
  imports: [RouterModule.forChild(routes)],
  // Exporta o RouterModule configurado para ser utilizado pelo FolderPageModule
  exports: [RouterModule],
})
export class FolderPageRoutingModule {}