import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonButtons, IonButton, 
  IonIcon, IonTitle, IonContent, IonAvatar, 
  IonList, IonItem, IonLabel, IonText 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, mailOutline, logOut } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, 
    IonIcon, IonTitle, IonContent, IonAvatar, 
    IonList, IonItem, IonLabel, IonText
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  displayName: string = 'Carregando...'; 
  email: string = '';
  private userSub!: Subscription;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({ arrowBack, mailOutline, logOut });
  }

  ngOnInit() {
    // Subscreve aos dados do utilizador guardados no Firestore através do teu serviço
    this.userSub = this.authService.userData$.subscribe(user => {
      if (user) {
        // Usa o campo 'nome' que gravaste no Firestore dentro do método register()
        this.displayName = user.nome || 'Utilizador';
        this.email = user.email || '';
      }
    });
  }

  ngOnDestroy() {
    // Boa prática: limpar a subscrição quando saímos da página para evitar fugas de memória
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  back() {
    this.navCtrl.navigateBack('/folder/calendario');
  }

  async logout() {
    try {
      await this.authService.logout();
      // Redireciona para o login e limpa o histórico de navegação
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}