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
  public abaAtiva: string = 'subtarefas'; // Controla qual o separador ativo no menu
  
  // Dados do grupo baseados no teu Storyboard
  public grupoDetalhado = {
    nome: 'Grupo INTHOM - Projeto Final',
    disciplina: 'IHM (Interação Homem-Máquina)',
    progresso: 50, // Percentagem
    membros: [
      { nome: 'Ana Matos', email: 'ana.matos@estg.ipvc.pt' },
      { nome: 'Duarte Costa', email: 'duarte.costa@estg.ipvc.pt' }
    ],
    subtarefas: [
      { titulo: 'Analisar resultados do questionário', responsavel: 'Duarte Costa', data: '2026-04-16', concluida: true },
      { titulo: 'Criar modelo conceptual', responsavel: 'Ana Matos', data: '2026-04-11', concluida: false }
    ]
  };

  // Variáveis para a edição
  public novoMembroNome: string = '';
  public novoMembroEmail: string = '';
  public grupoEmEdicao: any = {};

  constructor(private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    const idRecebido = this.route.snapshot.paramMap.get('id');
    if (idRecebido) {
      this.nomeDoGrupo = idRecebido;
      // Num cenário real, irias buscar os dados do grupo à BD com este ID
      // this.grupoDetalhado.nome = idRecebido; 
    }
  }

  // Navegação subtil no conteúdo (sem animação para manter o cabeçalho estático)
  voltarParaGrupos() {
    this.navCtrl.navigateBack('/folder/grupos', { animated: false });
  }

  obterIniciais(nome: string): string {
    return nome.substring(0, 1).toUpperCase();
  }

  /* --- LÓGICA DE EDIÇÃO --- */
  abrirEdicao(modal: any) {
    this.grupoEmEdicao = JSON.parse(JSON.stringify(this.grupoDetalhado));
    modal.present();
  }

  adicionarMembroEdicao() {
    if (this.novoMembroNome.trim().length > 0) {
      this.grupoEmEdicao.membros.push({
        nome: this.novoMembroNome.trim(),
        email: this.novoMembroEmail.trim() || 'sem_email@estg.ipvc.pt'
      });
      this.novoMembroNome = '';
      this.novoMembroEmail = '';
    }
  }

  removerMembroEdicao(index: number) {
    this.grupoEmEdicao.membros.splice(index, 1);
  }

  guardarEdicao(modal: any) {
    this.grupoDetalhado = JSON.parse(JSON.stringify(this.grupoEmEdicao));
    modal.dismiss();
  }
}