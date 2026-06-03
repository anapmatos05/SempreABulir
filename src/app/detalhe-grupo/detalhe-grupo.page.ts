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

  public nomeDoGrupo: string = '';
  public abaAtiva: string = 'subtarefas';
  
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

  public novoMembroNome: string = '';
  public grupoEmEdicao: any = {};
  
  public novaSubtarefa = { titulo: '', responsavel: '', data: '' };

  constructor(private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    const idRecebido = this.route.snapshot.paramMap.get('id');
    if (idRecebido) {
      this.nomeDoGrupo = idRecebido;
    }
  }

  voltarParaGrupos() {
    this.navCtrl.navigateBack('/folder/grupos', { animated: false });
  }

  obterIniciais(nome: string): string {
    return nome.substring(0, 1).toUpperCase();
  }

  abrirEdicao(modal: any) {
    this.grupoEmEdicao = JSON.parse(JSON.stringify(this.grupoDetalhado));
    modal.present();
  }

  adicionarMembroEdicao() {
    const nomeLimpo = this.novoMembroNome.trim();
    if (nomeLimpo.length > 0) {
      // Gera o e-mail automaticamente (remove acentos, põe minúsculas e troca espaços por pontos)
      const emailGerado = nomeLimpo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '.') + '@estg.ipvc.pt';

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
    this.grupoDetalhado = JSON.parse(JSON.stringify(this.grupoEmEdicao));
    modal.dismiss();
  }

  /* --- LÓGICA DA NOVA SUBTAREFA --- */
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
    const concluidas = this.grupoDetalhado.subtarefas.filter(t => t.concluida).length;
    this.grupoDetalhado.progresso = Math.round((concluidas / this.grupoDetalhado.subtarefas.length) * 100);
  }
}