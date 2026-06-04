import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

/**
 * Definição das rotas principais da aplicação.
 * Utilizamos Lazy Loading (loadChildren) para melhorar o desempenho, 
 * carregando os módulos apenas quando o utilizador acede à rota correspondente.
 */
const routes: Routes = [
  {
    // Redirecionamento inicial para a vista de Calendário
    path: '',
    redirectTo: 'folder/calendario', 
    pathMatch: 'full'
  },
  {
    // Rota da página principal (Folder) com parâmetro de identificação da vista
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    // Rota para a página de detalhes de grupo, recebendo o nome como parâmetro
    path: 'detalhe-grupo/:nome',
    loadChildren: () => import('./detalhe-grupo/detalhe-grupo.module').then( m => m.DetalheGrupoPageModule)
  }
];

@NgModule({
  imports: [
    // PreloadAllModules otimiza a experiência ao pré-carregar os módulos em background
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}