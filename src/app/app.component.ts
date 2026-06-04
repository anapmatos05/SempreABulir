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
  
  // 1. ADICIONAMOS A VARIÁVEL AQUI PARA O HTML DEIXAR DE DAR ERRO
  public appPages = [
    { title: 'Calendário', url: '/folder/calendario', icon: 'calendar' },
    { title: 'Tarefas', url: '/folder/tarefas', icon: 'checkbox' },
    { title: 'Grupos', url: '/folder/grupos', icon: 'people' }
  ];

  constructor(private platform: Platform) {
    this.iniciarApp();
  }

  async iniciarApp() {
    await this.platform.ready();
    
    // Bloqueia a rotação para ficar sempre em modo "Retrato" (em pé)
    if (this.platform.is('capacitor')) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        console.log('A rotação só é bloqueada no telemóvel nativo.');
      }
    }
  }
}