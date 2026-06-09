import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  public email: string = '';
  public password: string = '';
  public nome: string = '';
  public eRegistro: boolean = false;
  public loading: boolean = false;
  public erro: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Aguarda o estado de autenticação antes de redirecionar
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.navCtrl.navigateRoot('/folder', { animated: false });
      }
    });
  }

  async fazerLogin() {
    if (!this.email || !this.password) {
      this.erro = 'Por favor, preenche email e senha.';
      return;
    }

    this.loading = true;
    this.erro = '';
    try {
      await this.authService.login(this.email, this.password);
      this.navCtrl.navigateRoot('/folder', { animated: false });
    } catch (error: any) {
      this.erro = error.message;
    } finally {
      this.loading = false;
    }
  }

  async fazerRegistro() {
    if (!this.email || !this.password || !this.nome) {
      this.erro = 'Por favor, preenche todos os campos.';
      return;
    }

    if (this.password.length < 6) {
      this.erro = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.erro = '';
    try {
      await this.authService.register(this.email, this.password, this.nome);
      this.navCtrl.navigateRoot('/folder', { animated: false });
    } catch (error: any) {
      this.erro = error.message;
    } finally {
      this.loading = false;
    }
  }

  alternarModo() {
    this.eRegistro = !this.eRegistro;
    this.email = '';
    this.password = '';
    this.nome = '';
    this.erro = '';
  }
}
