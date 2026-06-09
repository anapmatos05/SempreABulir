import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Módulos essenciais para o funcionamento dos serviços de dados e rede
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule } from '@angular/common/http';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { firebaseConfig } from '../environments/firebase.config';

/**
 * Módulo raiz da aplicação (AppModule).
 * É aqui que registamos os módulos globais que estarão disponíveis
 * em toda a aplicação (persistência, chamadas HTTP e roteamento).
 */
@NgModule({
  declarations: [AppComponent], // Declaração do componente principal
  imports: [
    BrowserModule,              // Módulo necessário para correr a app num browser
    IonicModule.forRoot(),      // Inicialização global do framework Ionic
    AppRoutingModule,           // Configuração de rotas definida no AppRoutingModule
    IonicStorageModule.forRoot(), // Módulo global para o armazenamento local (Base de Dados)
    HttpClientModule,           // Módulo global para realizar chamadas HTTP (leitura de JSON)
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  providers: [
    // Define a estratégia de reutilização de rotas do Ionic para melhor performance
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent], // Define o componente raiz que inicia a aplicação
})
export class AppModule {}