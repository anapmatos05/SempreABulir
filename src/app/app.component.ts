import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  
  // A TUA LISTA DE PÁGINAS DO MENU LATERAL (O que faltava!)
  public appPages = [
    { title: 'Calendário', url: '/folder/calendario', icon: 'calendar' },
    { title: 'Tarefas', url: '/folder/tarefas', icon: 'checkbox' },
    { title: 'Grupos', url: '/folder/grupos', icon: 'people' }
  ];

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();

    if (this.platform.is('capacitor')) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
        console.log('Sucesso: Rotação de ecrã bloqueada na vertical!');
      } catch (error) {
        console.log('Aviso: O bloqueio de ecrã não está disponível no browser.', error);
      }
    }
  }
}