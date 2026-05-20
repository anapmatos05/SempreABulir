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
    { title: 'Inbox', url: '/folder/inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

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