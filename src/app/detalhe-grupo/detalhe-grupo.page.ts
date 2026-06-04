import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detalhe-grupo',
  templateUrl: './detalhe-grupo.page.html',
  styleUrls: ['./detalhe-grupo.page.scss'],
  standalone: false
})
export class DetalheGrupoPage implements OnInit {
  // Variáveis de estado e controlo da interface
  public nomeDoGrupo: string = '';
  public abaAtiva: string = 'subtarefas';
  
  // Estrutura de dados de demonstração (Mock Data) do grupo atual
  public grupoDetalhado = {
    nome: 'Grupo INTHOM - Projeto Final',
    disciplina: 'IHM (Interação Homem-Máquina)',
    progresso: 50,
    membros: [
      { nome: 'Ana Matos', email: 'ana.matos@estg.ipvc.pt' },
      { nome: 'Duarte Costa', email: 'duarte.costa@estg.ipvc.pt' }
    ],
    subtarefas: [
      { titulo: 'Analisar resultados do questionário', responsavel: 'Duarte Costa', data: '2026-04-16', concluida: true },
      { titulo: 'Criar modelo conceptual', responsavel: 'Ana Matos', data: '2026-04-11', concluida: false }
    ]
  };

  // Variáveis de suporte para os formulários e modais
  public novoMembroNome: string = '';
  public grupoEmEdicao: any = {};
  public novaSubtarefa = { titulo: '', responsavel: '', data: '' };

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    // Captura o parâmetro passado na rota (URL) e atualiza o contexto da página
    const nomeRecebido = this.route.snapshot.paramMap.get('nome');
    if (nomeRecebido) {
      this.nomeDoGrupo = nomeRecebido;
      this.grupoDetalhado.nome = nomeRecebido; 
    }
  }

  // ==========================================
  // NAVEGAÇÃO E UTILITÁRIOS
  // ==========================================

  voltarParaGrupos() {
    this.navCtrl.navigateBack('/folder/grupos', { animated: false });
  }

  obterIniciais(nome: string): string {
    return nome.substring(0, 1).toUpperCase();
  }

  // ==========================================
  // GESTÃO E EDIÇÃO DO GRUPO
  // ==========================================

  abrirEdicao(modal: any) {
    // Cria uma cópia profunda (Deep Copy) para garantir que as edições não alteram 
    // os dados originais caso o utilizador cancele a operação
    this.grupoEmEdicao = JSON.parse(JSON.stringify(this.grupoDetalhado));
    modal.present();
  }

  adicionarMembroEdicao() {
    const nomeLimpo = this.novoMembroNome.trim();
    if (nomeLimpo.length > 0) {
      // Geração automática do e-mail institucional baseado no nome inserido
      const emailGerado = nomeLimpo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentuação
        .replace(/\s+/g, '.') + '@estg.ipvc.pt'; // Substitui espaços por pontos

      this.grupoEmEdicao.membros.push({
        nome: nomeLimpo,
        email: emailGerado
      });
      this.novoMembroNome = '';
    }
  }

  removerMembroEdicao(index: number) {
    this.grupoEmEdicao.membros.splice(index, 1);
  }

  guardarEdicao(modal: any) {
    // Substitui os dados originais pelos dados editados (nova Deep Copy)
    this.grupoDetalhado = JSON.parse(JSON.stringify(this.grupoEmEdicao));
    modal.dismiss();
  }

  // ==========================================
  // GESTÃO DE SUBTAREFAS E PROGRESSO
  // ==========================================

  abrirNovaSubtarefa(modal: any) {
    this.novaSubtarefa = { titulo: '', responsavel: '', data: '' };
    modal.present();
  }

  guardarSubtarefa(modal: any) {
    if (this.novaSubtarefa.titulo.trim().length > 0) {
      this.grupoDetalhado.subtarefas.push({
        titulo: this.novaSubtarefa.titulo,
        responsavel: this.novaSubtarefa.responsavel || 'Por atribuir',
        data: this.novaSubtarefa.data || new Date().toISOString().split('T')[0],
        concluida: false
      });
      
      this.atualizarProgresso();
      modal.dismiss();
    }
  }

  alterarEstadoSubtarefa(tarefa: any) {
    tarefa.concluida = !tarefa.concluida;
    this.atualizarProgresso();
  }

  atualizarProgresso() {
    if (this.grupoDetalhado.subtarefas.length === 0) {
      this.grupoDetalhado.progresso = 0;
      return;
    }
    
    // Calcula a percentagem de conclusão baseada no rácio de subtarefas finalizadas
    const concluidas = this.grupoDetalhado.subtarefas.filter(t => t.concluida).length;
    this.grupoDetalhado.progresso = Math.round((concluidas / this.grupoDetalhado.subtarefas.length) * 100);
  }
}