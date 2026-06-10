import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { GrupoService } from '../services/grupo';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-detalhe-grupo',
  templateUrl: './detalhe-grupo.page.html',
  styleUrls: ['./detalhe-grupo.page.scss'],
  standalone: false
})
export class DetalheGrupoPage implements OnInit {
  public nomeDoGrupo: string = 'A carregar...';
  public abaAtiva: string = 'subtarefas';
  public grupoIdFirebase: string = '';
  
  public grupoDetalhado: any = {
    nome: 'A carregar...', disciplina: '', progresso: 0, membros: [], subtarefas: []
  };

  public novoMembroNome: string = '';
  public grupoEmEdicao: any = {};
  public novaSubtarefa = { titulo: '', responsavel: '', data: '' };
  
  public conversaGrupo: any[] = [];
  public novaMensagem: string = '';
  public nomeUtilizadorAtual: string = 'A carregar...';
  
  public ficheirosPartilhados: any[] = [];
  public novoFicheiroNome: string = '';
  public novoFicheiroAutor: string = '';
  public novoFicheiroData: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private grupoService: GrupoService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Usa o nome real, ou a primeira parte do email se não houver nome
        this.nomeUtilizadorAtual = user.displayName || user.email.split('@')[0];
      }
    });

    const idRecebido = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('nome');
    
    if (idRecebido) {
      this.grupoIdFirebase = idRecebido;

      // OUVIR O GRUPO (Nome, Membros, Chat, Ficheiros) EM TEMPO REAL
      this.grupoService.getDetalhesGrupo(this.grupoIdFirebase).subscribe(grupoCloud => {
        if (grupoCloud) {
          this.nomeDoGrupo = grupoCloud.nome;
          this.grupoDetalhado = grupoCloud;
          this.grupoDetalhado.progresso = grupoCloud.progresso || 0;
          this.grupoDetalhado.membros = this.normalizarMembros(grupoCloud.membros || []);
          
          // Carrega o chat e ficheiros que vieram da nuvem
          this.conversaGrupo = grupoCloud.conversaGrupo || [];
          this.ficheirosPartilhados = grupoCloud.ficheirosPartilhados || [];
        
        }
      });

      // OUVIR AS SUBTAREFAS EM TEMPO REAL
      this.grupoService.getSubtarefas(this.grupoIdFirebase).subscribe(tarefasCloud => {
        if (this.grupoDetalhado) {
          this.grupoDetalhado.subtarefas = tarefasCloud || [];
          this.atualizarProgresso(); 
        }
      });
    }
  }

  normalizarMembros(membros: any[]): any[] {
    return membros.map(membro => {
      if (typeof membro === 'string') {
        const nome = membro.trim();
        return { nome, email: nome.toLowerCase().replace(/\s+/g, '.') + '@estg.ipvc.pt' };
      }
      return { nome: membro?.nome || '', email: membro?.email || '' };
    });
  }

  voltarParaGrupos() {
    this.navCtrl.navigateBack('/folder/grupos', { animated: false });
  }

  obterIniciais(nome: string | any): string {
    const valor = typeof nome === 'string' ? nome : nome?.nome || '';
    return valor ? valor.substring(0, 1).toUpperCase() : '';
  }

  abrirEdicao(modal: any) {
    this.grupoEmEdicao = JSON.parse(JSON.stringify(this.grupoDetalhado));
    modal.present();
  }

  adicionarMembroEdicao() {
    const nomeLimpo = this.novoMembroNome.trim();
    if (nomeLimpo.length > 0) {
      const emailGerado = nomeLimpo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.') + '@estg.ipvc.pt';
      this.grupoEmEdicao.membros.push({ nome: nomeLimpo, email: emailGerado });
      this.novoMembroNome = '';
    }
  }

  removerMembroEdicao(index: number) {
    this.grupoEmEdicao.membros.splice(index, 1);
  }

  // 🚀 GUARDAR EDIÇÃO NA NUVEM
  async guardarEdicao(modal: any) {
    await this.grupoService.atualizarGrupo(this.grupoIdFirebase, {
      nome: this.grupoEmEdicao.nome,
      disciplina: this.grupoEmEdicao.disciplina,
      membros: this.grupoEmEdicao.membros
    });
    modal.dismiss();
  }

  abrirNovaSubtarefa(modal: any) {
    this.novaSubtarefa = { titulo: '', responsavel: '', data: '' };
    modal.present();
  }

  async guardarSubtarefa(modal: any) {
    if (this.novaSubtarefa.titulo.trim().length > 0) {
      await this.grupoService.adicionarSubtarefa(this.grupoIdFirebase, {
        titulo: this.novaSubtarefa.titulo,
        responsavel: this.novaSubtarefa.responsavel || 'Por atribuir',
        data: this.novaSubtarefa.data || new Date().toISOString().split('T')[0],
        concluida: false
      });
      modal.dismiss();
    }
  }

  // 🚀 ATUALIZAR VISTO DA TAREFA NA NUVEM
  async alterarEstadoSubtarefa(tarefa: any) {
    await this.grupoService.atualizarSubtarefa(this.grupoIdFirebase, tarefa.id, {
      concluida: !tarefa.concluida
    });
  }

  // 🚀 ENVIAR MENSAGEM PARA A NUVEM
  async enviarMensagem() {
    const texto = this.novaMensagem.trim();
    if (!texto) return;

    const novaMsg = {
      autor: this.nomeUtilizadorAtual, // 👈 Agora usa o teu nome real!
      texto: texto,
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const novaListaChat = [...this.conversaGrupo, novaMsg];
    await this.grupoService.atualizarGrupo(this.grupoIdFirebase, { conversaGrupo: novaListaChat });
    this.novaMensagem = '';
  }

  // 🚀 ADICIONAR FICHEIRO À NUVEM
  async adicionarFicheiro() {
    const nome = this.novoFicheiroNome.trim();
    if (!nome) return;

    const novoDoc = {
      nome,
      autor: this.novoFicheiroAutor.trim() || this.nomeUtilizadorAtual,
      data: this.novoFicheiroData || new Date().toISOString().split('T')[0]
    };

    const novaListaFicheiros = [novoDoc, ...this.ficheirosPartilhados];
    await this.grupoService.atualizarGrupo(this.grupoIdFirebase, { ficheirosPartilhados: novaListaFicheiros });
    
    this.novoFicheiroNome = '';
    this.novoFicheiroAutor = '';
  }

  baixarFicheiro(ficheiro: any) {
    alert(`Ação fictícia: baixar ${ficheiro.nome}`);
  }

  // 🚀 REMOVER FICHEIRO DA NUVEM
  async removerFicheiro(ficheiro: any) {
    const novaListaFicheiros = this.ficheirosPartilhados.filter(f => f.nome !== ficheiro.nome);
    await this.grupoService.atualizarGrupo(this.grupoIdFirebase, { ficheirosPartilhados: novaListaFicheiros });
  }

  // Função interna de contas (Atualiza o progresso global no Firebase)
  async atualizarProgresso() {
    if (!this.grupoDetalhado.subtarefas || this.grupoDetalhado.subtarefas.length === 0) {
      if (this.grupoDetalhado.progresso !== 0) {
        await this.grupoService.atualizarGrupo(this.grupoIdFirebase, { progresso: 0 });
      }
      return;
    }
    
    const concluidas = this.grupoDetalhado.subtarefas.filter((t: any) => t.concluida).length;
    const progressoNovo = Math.round((concluidas / this.grupoDetalhado.subtarefas.length) * 100);
    
    if (this.grupoDetalhado.progresso !== progressoNovo) {
      await this.grupoService.atualizarGrupo(this.grupoIdFirebase, { progresso: progressoNovo });
    }
  }

  obterDiasParaEntrega(dataString: string): number {
    if (!dataString) return 0;
    const prazo = new Date(dataString);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    prazo.setHours(0, 0, 0, 0);
    return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  obterTextoPrazo(dataString: string, concluida: boolean): string {
    if (concluida) return 'Concluída';
    const dias = this.obterDiasParaEntrega(dataString);
    if (dias < 0) return 'Atrasada';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return '1 dia';
    return `${dias} dias`;
  }

  obterCorPrazo(dataString: string, concluida: boolean): any {
    if (concluida) return { background: '#f0fdf4', border: '1px solid #bbf7d0', text: '#16a34a', labelBg: '#dcfce7', labelColor: '#166534' };
    const dias = this.obterDiasParaEntrega(dataString);
    if (dias < 0) return { background: '#fef2f2', border: '1px solid #fecaca', text: '#b91c1c', labelBg: '#fee2e2', labelColor: '#7f1d1d' };
    if (dias === 0) return { background: '#fee2e2', border: '1px solid #fca5a5', text: '#b91c1c', labelBg: '#fecaca', labelColor: '#991b1b' };
    if (dias === 1) return { background: '#fffbeb', border: '1px solid #fcd34d', text: '#b45309', labelBg: '#fde68a', labelColor: '#92400e' };
    return { background: '#ecfdf5', border: '1px solid #86efac', text: '#15803d', labelBg: '#bbf7d0', labelColor: '#166534' };
  }
}