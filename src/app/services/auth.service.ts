import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 1️⃣ A CHAVE MÁGICA: Injetamos o contexto global do Angular
  private injector = inject(EnvironmentInjector);

  private currentUserSubject = new BehaviorSubject<any>(undefined);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userDataSubject = new BehaviorSubject<any>(null);
  public userData$ = this.userDataSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.initializeAuthState();
  }

  // Inicializa o estado da autenticação
  private initializeAuthState() {
    this.afAuth.authState.subscribe(async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        await this.loadUserData(user.uid);
      } else {
        this.userDataSubject.next(null);
      }
    });
  }

  // Carrega dados do utilizador do Firestore
  private async loadUserData(uid: string) {
    try {
      // 2️⃣ Envolvemos a chamada na zona segura
      const userSnap = await runInInjectionContext(this.injector, () =>
        this.afs.doc(`utilizadores/${uid}`).ref.get()
      );
      if (userSnap.exists) {
        this.userDataSubject.next(userSnap.data());
      }
    } catch (error) {
      console.error('Erro ao carregar dados do utilizador:', error);
    }
  }

  // Regista novo utilizador
  async register(email: string, password: string, nome: string): Promise<any> {
    try {
      // 3️⃣ Envolvemos a criação da conta na zona segura
      const userCredential = await runInInjectionContext(this.injector, () =>
        this.afAuth.createUserWithEmailAndPassword(email, password)
      );
      const user = userCredential.user;

      if (user) {
        await user.updateProfile({ displayName: nome });
        
        // Guardar dados do utilizador no Firestore (também na zona segura)
        await runInInjectionContext(this.injector, () =>
          this.afs.doc(`utilizadores/${user.uid}`).set({
            uid: user.uid,
            email: email,
            nome: nome,
            nomeLower: nome.toLowerCase(),
            dataCriacao: new Date().toISOString(),
            grupos: []
          })
        );
      }

      return user;
    } catch (error: any) {
      console.error('Erro no registo:', error);
      throw new Error(this.tratarErroAuth(error.code));
    }
  }

  // Login com email e senha
  async login(email: string, password: string): Promise<any> {
    try {
      // 4️⃣ Envolvemos o login na zona segura
      return await runInInjectionContext(this.injector, () =>
        this.afAuth.signInWithEmailAndPassword(email, password)
      );
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(this.tratarErroAuth(error.code));
    }
  }

  // Logout adaptado para a sintaxe correta do AngularFire Compat
  async logout(): Promise<void> {
    try {
      await runInInjectionContext(this.injector, () => this.afAuth.signOut());
      this.currentUserSubject.next(null);
      this.userDataSubject.next(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  // Obtém utilizador atual
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Obtém dados do utilizador atual
  getUserData(): any {
    return this.userDataSubject.value;
  }

  // Verifica se está autenticado comparando corretamente
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.currentUserSubject.value !== undefined;
  }

  // Trata erros da autenticação
  private tratarErroAuth(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está registado.';
      case 'auth/invalid-email':
        return 'Email inválido.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email ou senha incorretos.';
      default:
        return 'Erro de autenticação. Tenta novamente.';
    }
  }
}