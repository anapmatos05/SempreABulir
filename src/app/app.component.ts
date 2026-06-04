import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@capacitor/screen-orientation';

/**
 * Componente raiz da aplicação.
 * Responsável por configurar as definições nativas (ex: orientação)
 * e definir as rotas que aparecem no menu lateral.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  
  // Definição das páginas acessíveis através do menu lateral
  public appPages = [
    { title: 'Calendário', url: '/folder/calendario', icon: 'calendar' },
    { title: 'Tarefas', url: '/folder/tarefas', icon: 'checkbox' },
    { title: 'Grupos', url: '/folder/grupos', icon: 'people' }
  ];

  constructor(private platform: Platform) {
    this.iniciarApp();
  }

  /**
   * Configuração de inicialização da aplicação:
   * 1. Aguarda que a plataforma Ionic esteja totalmente carregada.
   * 2. Bloqueia a orientação do ecrã para 'Portrait' se correr em ambiente nativo.
   */
  async iniciarApp() {
    await this.platform.ready();
    
    // Verificação de ambiente para garantir execução apenas em dispositivos móveis (Capacitor)
    if (this.platform.is('capacitor')) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        // Log para ambiente de desenvolvimento (browser ignora o bloqueio)
        console.log('A rotação só é bloqueada em ambiente nativo.');
      }
    }
  }
}