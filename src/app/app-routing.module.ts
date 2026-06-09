import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

/**
 * Definição das rotas principais da aplicação.
 * Utilizamos Lazy Loading para melhorar o desempenho, 
 * carregando os módulos/componentes apenas quando o utilizador acede à rota correspondente.
 */
const routes: Routes = [
  {
    // Página de perfil do utilizador (Alterado para componente Standalone)
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
  },
  
  {
    // Redirecionamento inicial para login
    path: '',
    redirectTo: 'login', 
    pathMatch: 'full'
  },
  {
    // Rota de login (sem autenticação)
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'folder',
    redirectTo: 'folder/calendario',
    pathMatch: 'full'
  },
  {
    // Rota da página principal (Folder) com parâmetro de identificação da vista
    path: 'folder/:id',
    canActivate: [AuthGuard],
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    // Rota para a página de detalhes de grupo, recebendo o nome como parâmetro
    path: 'detalhe-grupo/:nome',
    canActivate: [AuthGuard],
    loadChildren: () => import('./detalhe-grupo/detalhe-grupo.module').then( m => m.DetalheGrupoPageModule)
  }
];

@NgModule({
  imports: [
    // PreloadAllModules otimiza a experiência ao pré-carregar os recursos em background
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}