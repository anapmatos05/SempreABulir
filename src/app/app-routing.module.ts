import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/calendario', 
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'detalhe-grupo',
    loadChildren: () => import('./detalhe-grupo/detalhe-grupo.module').then( m => m.DetalheGrupoPageModule)
  },

  // Altera a rota que o Ionic gerou para ficar assim (adicionando o /:id):
  {
    path: 'detalhe-grupo/:id',
    loadChildren: () => import('./detalhe-grupo/detalhe-grupo.module').then( m => m.DetalheGrupoPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
