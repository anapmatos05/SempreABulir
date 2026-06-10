import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
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
  public resultadosPesquisa: any[] = [];
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
    private authService: AuthService,
    private toastController: ToastController
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
          
          // 🚀 LÓGICA DAS NOTIFICAÇÕES DE CHAT AQUI:
          const mensagensNuvem = grupoCloud.conversaGrupo || [];

          // Se já tínhamos mensagens carregadas, e de repente chegam mais mensagens da nuvem...
          if (this.conversaGrupo.length > 0 && mensagensNuvem.length > this.conversaGrupo.length) {
            
            // Vai buscar a última mensagem que acabou de chegar
            const novaMensagem = mensagensNuvem[mensagensNuvem.length - 1];

            // Mostra a notificação APENAS se a mensagem NÃO for tua
            if (novaMensagem.autor !== this.nomeUtilizadorAtual) {
              this.mostrarNotificacao(novaMensagem.autor, novaMensagem.texto);
            }
          }

          // Atualiza o chat no ecrã com as mensagens novas
          this.conversaGrupo = mensagensNuvem;

          // 🚀 NOVA LINHA: Guarda na memória do telemóvel que já leste todas estas mensagens
          localStorage.setItem(`lidas_${this.grupoIdFirebase}`, mensagensNuvem.length.toString());
        }
      });

      // OUVIR AS SUBTAREFAS EM TEMPO REAL
      this.grupoService.getSubtarefas(this.grupoIdFirebase).subscribe(tarefasCloud => {
        if (this.grupoDetalhado) {
          this.grupoDetalhado.subtarefas = tarefasCloud || [];
          this.atualizarProgresso(); 
        }
      });

      // OUVIR OS FICHEIROS EM TEMPO REAL
      this.grupoService.getFicheiros(this.grupoIdFirebase).subscribe(ficheiros => {
        this.ficheirosPartilhados = ficheiros || [];
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
    // Deixa o Ionic gerir o histórico e a animação naturalmente
    this.navCtrl.back(); 
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

  // 🚀 Pesquisar utilizadores na base de dados
  async pesquisarMembros() {
    const termo = this.novoMembroNome.trim();
    if (termo.length < 2) {
      this.resultadosPesquisa = [];
      return;
    }
    try {
      this.resultadosPesquisa = await this.grupoService.procurarUtilizadores(termo);
    } catch (erro) {
      console.error('Erro ao procurar utilizadores:', erro);
    }
  }

  // 🚀 Adicionar o utilizador clicado à lista de edição
  selecionarMembroPesquisa(utilizadorEncontrado: any) {
    // Verifica se já está no grupo para não haver pessoas duplicadas
    const jaExiste = this.grupoEmEdicao.membros.find((m: any) => m.email === utilizadorEncontrado.email || m.nome === utilizadorEncontrado.nome);
    
    if (!jaExiste) {
      this.grupoEmEdicao.membros.push({
        nome: utilizadorEncontrado.nome,
        email: utilizadorEncontrado.email
      });
    }
    
    // Limpa a barra de pesquisa e esconde os resultados
    this.novoMembroNome = '';
    this.resultadosPesquisa = [];
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

  // 🚀 ATUALIZAR VISTO DA TAREFA (Agora instantâneo e sem piscar!)
  async alterarEstadoSubtarefa(tarefa: any) {
    // 1. Atualização Otimista: Mudamos logo no ecrã antes de o Firebase responder!
    tarefa.concluida = !tarefa.concluida;
    this.atualizarProgresso(); // A barra amarela avança imediatamente!

    // 2. Manda para a nuvem em silêncio
    try {
      await this.grupoService.atualizarSubtarefa(this.grupoIdFirebase, tarefa.id, {
        concluida: tarefa.concluida
      });
    } catch (erro) {
      // Se a net falhar, desfazemos o clique e avisamos
      console.error('Erro ao atualizar na nuvem:', erro);
      tarefa.concluida = !tarefa.concluida; 
      this.atualizarProgresso();
    }
  }

  // Função âncora: Ajuda o Angular a saber qual tarefa é qual, para não ter de apagar a lista toda
  trackPorTarefa(index: number, tarefa: any) {
    return tarefa.id;
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
  adicionarFicheiro() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    
    input.onchange = async (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;
      
      try {
        await this.grupoService.uploadFicheiro(this.grupoIdFirebase, file, this.nomeUtilizadorAtual);
        // ficheiros atualizam automaticamente via Observable
      } catch (erro) {
        console.error('Erro ao enviar ficheiro:', erro);
      }
    };
    
    input.click();
  }

  baixarFicheiro(ficheiro: any) {
    window.open(ficheiro.url, '_blank');
  }

  // 🚀 REMOVER FICHEIRO DA NUVEM
  async removerFicheiro(ficheiro: any) {
    if (confirm('Tens a certeza que queres apagar este ficheiro?')) {
      await this.grupoService.removerFicheiro(this.grupoIdFirebase, ficheiro.id);
    }
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

  openProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  // 🚀 Função para desenhar a notificação no ecrã
  async mostrarNotificacao(autor: string, texto: string) {
    const toast = await this.toastController.create({
      header: `Nova mensagem de ${autor}`,
      message: texto,
      duration: 3500, // Desaparece após 3.5 segundos
      position: 'top',
      color: 'dark',
      buttons: [
        {
          text: 'Ver',
          role: 'cancel',
          handler: () => {
            // Se o utilizador clicar em "Ver", a app muda logo para a aba do chat!
            this.abaAtiva = 'chat';
          }
        }
      ]
    });
    await toast.present();
  }

  obterIconeFicheiro(nome: string): string {
    if (!nome) return 'document';
    const n = nome.toLowerCase();
    if (n.endsWith('.pdf')) return 'document-text';
    if (n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.png')) return 'image';
    return 'document';
  }
}