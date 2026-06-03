import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalheGrupoPageRoutingModule } from './detalhe-grupo-routing.module';

import { DetalheGrupoPage } from './detalhe-grupo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalheGrupoPageRoutingModule
  ],
  declarations: [DetalheGrupoPage]
})
export class DetalheGrupoPageModule {}
