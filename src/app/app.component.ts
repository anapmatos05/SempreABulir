import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@capacitor/screen-orientation';
// Importação necessária para manipular a barra de topo (notificações e bateria)
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Componente raiz da aplicação.
 * Responsável por configurar as definições nativas (ex: orientação, barra de estado)
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
   * 3. Configura a Barra de Estado para não se sobrepor à aplicação e ter fundo amarelo.
   */
  async iniciarApp() {
    await this.platform.ready();
    
    // Verificação de ambiente para garantir execução apenas em dispositivos móveis (Capacitor)
    if (this.platform.is('capacitor')) {
      
      // BLOCO 1: Orientação do Ecrã
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        // Log para ambiente de desenvolvimento (browser ignora o bloqueio)
        console.log('A rotação só é bloqueada em ambiente nativo.');
      }

      // BLOCO 2: Barra de Estado (StatusBar / Notch)
      try {
        // Impede a aplicação de ficar escondida por trás da barra de notificações/câmara
        await StatusBar.setOverlaysWebView({ overlay: false });

        // Define a cor de fundo da barra para amarelo (podes ajustar o código HEX se precisares do teu tom exato)
        await StatusBar.setBackgroundColor({ color: '#FFD700' }); 

        // Como o amarelo é uma cor clara, força a hora e os ícones de bateria a ficarem escuros (Style.Light)
        await StatusBar.setStyle({ style: Style.Light });
      } catch (error) {
        console.log('A configuração da StatusBar só tem efeito no telemóvel.');
      }
      
    }
  }
}