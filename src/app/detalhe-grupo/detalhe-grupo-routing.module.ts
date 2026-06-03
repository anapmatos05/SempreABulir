import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalheGrupoPage } from './detalhe-grupo.page';

const routes: Routes = [
  {
    path: '',
    component: DetalheGrupoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalheGrupoPageRoutingModule {}
