import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Módulos essenciais para o funcionamento dos serviços de dados e rede
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule } from '@angular/common/http';

// Firebase (A configuração da tua colega - Versão Compat)
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { firebaseConfig } from '../environments/firebase.config';

// Firebase (A nossa configuração - Versão Modular)
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

/**
 * Módulo raiz da aplicação (AppModule).
 * É aqui que registamos os módulos globais que estarão disponíveis
 * em toda a aplicação (persistência, chamadas HTTP e roteamento).
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    
    // Inicialização do Firebase da Ana
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],

  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // O "Chassi" Moderno do Firebase:
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    
    // O "Motor" Moderno da Base de Dados:
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}