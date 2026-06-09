import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DataService } from '../services/data';

@Component({
  selector: 'app-detalhe-grupo',
  templateUrl: './detalhe-grupo.page.html',
  styleUrls: ['./detalhe-grupo.page.scss'],
  standalone: false
})
export class DetalheGrupoPage implements OnInit {
  // Variáveis de controlo da interface e abas
  public nomeDoGrupo: string = '';
  public abaAtiva: string = 'subtarefas'; // Controla qual a aba visível (subtarefas, chat ou ficheiros)
  
  // Base de dados simulada (Mock Data) do grupo - Conforme o teu Storyboard
  public grupoDetalhado: any = {
    nome: '',
    disciplina: '',
    progresso: 0,
    membros: [],
    subtarefas: []
  };

  // Variáveis auxiliares para os formulários e janelas pop-up (modais)
  public novoMembroNome: string = '';
  public grupoEmEdicao: any = {};
  public novaSubtarefa = { titulo: '', responsavel: '', data: '' };
  public conversaGrupo: any[] = [];
  public novaMensagem: string = '';
  public autoresChat: string[] = ['Ana Matos', 'Duarte Costa'];
  public autorMensagem: string = 'Ana Matos';

  atualizarAutoresChat() {
    const autores = (this.grupoDetalhado.membros ?? [])
      .map((m: any) => typeof m === 'string' ? m : m?.nome ?? '')
      .filter((nome: string) => nome && nome.trim().length > 0);

    if (autores.length > 0) {
      this.autoresChat = autores;
      if (!this.autoresChat.includes(this.autorMensagem)) {
        this.autorMensagem = this.autoresChat[0];
      }
    }
  }
  public ficheirosPartilhados: any[] = [
    { nome: 'Analise_Questionario.pdf', autor: 'Duarte Costa', data: '2026-04-07' },
    { nome: 'Rascunho_Modelo_Conceptual.docx', autor: 'Ana Matos', data: '2026-04-08' }
  ];
  public novoFicheiroNome: string = '';
  public novoFicheiroAutor: string = '';
  public novoFicheiroData: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private dataService: DataService
  ) { }

  ngOnInit() {
    // Captura o nome do grupo enviado pela rota/URL da página anterior
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.nomeDoGrupo = nomeRecebido;
      const grupo = this.dataService.obterGrupoPorNome(nomeRecebido);
      if (grupo) {
        this.grupoDetalhado = grupo;
        this.grupoDetalhado.subtarefas = this.grupoDetalhado.subtarefas ?? this.grupoDetalhado.tarefas ?? [];
        this.grupoDetalhado.progresso = this.grupoDetalhado.progresso ?? 0;
        this.grupoDetalhado.membros = this.normalizarMembros(this.grupoDetalhado.membros ?? []);
        this.atualizarAutoresChat();
      } else {
        this.grupoDetalhado.nome = nomeRecebido;
      }
    }
  }

  normalizarMembros(membros: any[]): any[] {
    return membros.map(membro => {
      if (typeof membro === 'string') {
        const nome = membro.trim();
        return {
          nome,
          email: nome.toLowerCase().replace(/\s+/g, '.') + '@estg.ipvc.pt'
        };
      }
      return {
        nome: membro?.nome ?? '',
        email: membro?.email ?? ''
      };
    });
  }

  // ==========================================
  // NAVEGAÇÃO E REQUISITOS VISUAIS
  // ==========================================

  // Função para voltar atrás para a listagem principal de grupos
  voltarParaGrupos() {
    this.navCtrl.navigateBack('/folder/grupos', { animated: false });
  }

  // Extrai a primeira letra do nome para desenhar o avatar circular colorido (Ex: "Ana" -> "A")
  obterIniciais(nome: string | any): string {
    const valor = typeof nome === 'string' ? nome : nome?.nome ?? '';
    if (!valor) return '';
    return valor.substring(0, 1).toUpperCase();
  }

  // ==========================================
  // GESTÃO E EDIÇÃO DOS MEMBROS DO GRUPO
  // ==========================================

  // Abre a janela de edição e cria uma cópia segura dos dados
  abrirEdicao(modal: any) {
    this.grupoEmEdicao = JSON.parse(JSON.stringify(this.grupoDetalhado));
    modal.present();
  }

  // Adiciona um membro novo e gera automaticamente o e-mail do IPVC limpo de acentos
  adicionarMembroEdicao() {
    const nomeLimpo = this.novoMembroNome.trim();
    if (nomeLimpo.length > 0) {
      // Cria o formato de email: "nome.sobrenome@estg.ipvc.pt"
      const emailGerado = nomeLimpo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos e cedilhas
        .replace(/\s+/g, '.') + '@estg.ipvc.pt'; // Troca os espaços por pontos

      this.grupoEmEdicao.membros.push({
        nome: nomeLimpo,
        email: emailGerado
      });
      this.novoMembroNome = ''; // Limpa o campo de texto
    }
  }

  // Remove um membro temporariamente da lista de edição
  removerMembroEdicao(index: number) {
    this.grupoEmEdicao.membros.splice(index, 1);
  }

  // Confirma e guarda as alterações feitas no grupo
  async guardarEdicao(modal: any) {
    Object.assign(this.grupoDetalhado, this.grupoEmEdicao);
    this.atualizarAutoresChat();
    await this.dataService.salvarGrupos();
    modal.dismiss();
  }

  // ==========================================
  // LOGICA DE SUBTAREFAS E PROGRESSO AUTOMÁTICO
  // ==========================================

  // Prepara e abre a janela para criar uma nova subtarefa
  abrirNovaSubtarefa(modal: any) {
    this.novaSubtarefa = { titulo: '', responsavel: '', data: '' };
    modal.present();
  }

  // Guarda a nova subtarefa e atualiza o progresso do grupo na hora
  async guardarSubtarefa(modal: any) {
    if (this.novaSubtarefa.titulo.trim().length > 0) {
      this.grupoDetalhado.subtarefas.push({
        titulo: this.novaSubtarefa.titulo,
        responsavel: this.novaSubtarefa.responsavel || 'Por atribuir',
        data: this.novaSubtarefa.data || new Date().toISOString().split('T')[0],
        concluida: false
      });
      
      this.atualizarProgresso(); // Recalcula a barra de progresso
      await this.dataService.salvarGrupos();
      modal.dismiss();
    }
  }

  // Ativa/Desativa o visto da tarefa ao clicar e recalcula a percentagem
  async alterarEstadoSubtarefa(tarefa: any) {
    tarefa.concluida = !tarefa.concluida;
    this.atualizarProgresso();
    await this.dataService.salvarGrupos();
  }

  enviarMensagem() {
    const texto = this.novaMensagem.trim();
    if (!texto) {
      return;
    }

    const horario = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const deMim = this.autorMensagem === 'Ana Matos';

    this.conversaGrupo.push({ autor: this.autorMensagem, texto, horario, deMim });
    this.novaMensagem = '';
  }

  adicionarFicheiro() {
    const nome = this.novoFicheiroNome.trim();
    if (!nome) {
      return;
    }

    const autor = this.novoFicheiroAutor.trim() || 'Ana Matos';
    const data = this.novoFicheiroData || new Date().toISOString().split('T')[0];

    this.ficheirosPartilhados.unshift({ nome, autor, data });
    this.novoFicheiroNome = '';
    this.novoFicheiroAutor = '';
    this.novoFicheiroData = new Date().toISOString().split('T')[0];
  }

  baixarFicheiro(ficheiro: any) {
    alert(`Ação fictícia: baixar ${ficheiro.nome}`);
  }

  removerFicheiro(ficheiro: any) {
    this.ficheirosPartilhados = this.ficheirosPartilhados.filter(f => f !== ficheiro);
  }

  obterDataSemHorario(dataString: string): Date {
    if (!dataString) {
      return new Date();
    }
    const partes = dataString.split('-').map(Number);
    if (partes.length === 3) {
      return new Date(partes[0], partes[1] - 1, partes[2]);
    }
    return new Date(dataString);
  }

  obterDiasParaEntrega(dataString: string): number {
    const prazo = this.obterDataSemHorario(dataString);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    prazo.setHours(0, 0, 0, 0);
    const diffMs = prazo.getTime() - hoje.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  obterTextoPrazo(dataString: string, concluida: boolean): string {
    if (concluida) {
      return 'Concluída';
    }
    const dias = this.obterDiasParaEntrega(dataString);
    if (dias < 0) {
      return 'Atrasada';
    }
    if (dias === 0) {
      return 'Hoje';
    }
    if (dias === 1) {
      return '1 dia';
    }
    return `${dias} dias`;
  }

  obterCorPrazo(dataString: string, concluida: boolean): { background: string; border: string; text: string; labelBg: string; labelColor: string } {
    if (concluida) {
      return {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        text: '#16a34a',
        labelBg: '#dcfce7',
        labelColor: '#166534'
      };
    }
    const dias = this.obterDiasParaEntrega(dataString);
    if (dias < 0) {
      return {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        text: '#b91c1c',
        labelBg: '#fee2e2',
        labelColor: '#7f1d1d'
      };
    }
    if (dias === 0) {
      return {
        background: '#fee2e2',
        border: '1px solid #fca5a5',
        text: '#b91c1c',
        labelBg: '#fecaca',
        labelColor: '#991b1b'
      };
    }
    if (dias === 1) {
      return {
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        text: '#b45309',
        labelBg: '#fde68a',
        labelColor: '#92400e'
      };
    }
    return {
      background: '#ecfdf5',
      border: '1px solid #86efac',
      text: '#15803d',
      labelBg: '#bbf7d0',
      labelColor: '#166534'
    };
  }

  // Faz as contas automáticas da percentagem do progresso (0% a 100%)
  atualizarProgresso() {
    if (this.grupoDetalhado.subtarefas.length === 0) {
      this.grupoDetalhado.progresso = 0;
      return;
    }
    
    // Filtra quantas tarefas têm o visto "true" e faz a média matemática
    const concluidas = this.grupoDetalhado.subtarefas.filter((t: any) => t.concluida).length;
    this.grupoDetalhado.progresso = Math.round((concluidas / this.grupoDetalhado.subtarefas.length) * 100);
  }
}