import { Component } from '@angular/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Calendário', url: '/folder/Calendario', icon: 'calendar' },
    { title: 'Tarefas', url: '/folder/Tarefas', icon: 'checkbox' },
    { title: 'Grupos', url: '/folder/Grupos', icon: 'people' },
  ];
  public labels = []; // Mantemos vazio para não criar distrações cá em baixo
  
  constructor() {
    // Ativa o bloqueio assim que a app inicia
    this.lockOrientation();
  }

  async lockOrientation() {
    try {
      // Bloqueia o ecrã estritamente na vertical (Portrait)
      await ScreenOrientation.lock({ orientation: 'portrait' });
    } catch (error) {
      console.log('A rotação automática só bloqueia no telemóvel real:', error);
    }
  }
}