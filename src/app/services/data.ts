import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';

// As tuas interfaces passam a viver aqui para poderem ser usadas em toda a app
export interface NovoPrazo {
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  disciplina: string;
  prioridade: string;
  notificacao: boolean;
  estado: 'Pendente' | 'Em Progresso' | 'Concluída';
}

export interface DiaSemana {
  nome: string;
  numero: number;
  isHoje: boolean;
  dataCompleta?: Date;
  temPrazo: boolean;
  prazoTitulo?: string;
  prazoHora?: string;
}

@Injectable({
  providedIn: 'root' // Isto garante que o serviço funciona perfeitamente com a tua estrutura NgModule
})
export class DataService {
  public listaDePrazos: NovoPrazo[] = [];
  public listaGrupos: any[] = [];
  private isPronto = false; // Garante que a BD carregou antes de mostrar dados
  public listaDisciplinasJSON: string[] = [];

  constructor(private storage: Storage, private http: HttpClient) {
    this.init();
    this.carregarDisciplinas(); // Começa a ler o JSON logo ao abrir a app
  }

  private carregarDisciplinas() {
    // Lê o ficheiro JSON que criámos na pasta assets
    this.http.get<{disciplinas: string[]}>('assets/disciplinas.json').subscribe(dados => {
      this.listaDisciplinasJSON = dados.disciplinas;
    });
  }
  
  async init() {
    await this.storage.create();
    await this.carregarDadosDoStorage();
    this.isPronto = true;
  }

  // ==========================================
  // LÓGICA DO STORAGE (LEITURA E ESCRITA)
  // ==========================================
  private async carregarDadosDoStorage() {
    const tarefasGuardadas = await this.storage.get('meus_prazos');
    if (tarefasGuardadas && tarefasGuardadas.length > 0) {
      this.listaDePrazos = tarefasGuardadas;
    } else {
      // Dados de demonstração caso a base de dados esteja vazia
      this.listaDePrazos = [
        {
          titulo: 'Relatório SO - Gestão de Memória',
          descricao: 'Escrever relatório sobre algoritmos de gestão de memória em sistemas operativos',
          data: '2026-05-21',
          hora: '23:00',
          disciplina: 'Sistemas Operativos',
          prioridade: 'alta',
          notificacao: false,
          estado: 'Em Progresso'
        },
        {
          titulo: 'Trabalho REDSIS - Protocolo TCP/IP',
          descricao: 'Análise detalhada do protocolo TCP/IP e implementação de exemplo',
          data: '2026-05-22',
          hora: '18:00',
          disciplina: 'Redes de Computadores',
          prioridade: 'alta',
          notificacao: false,
          estado: 'Pendente'
        }
      ];
    }

    const gruposGuardados = await this.storage.get('meus_grupos');
    if (gruposGuardados) {
      this.listaGrupos = gruposGuardados;
    }
  }

  // ==========================================
  // MÉTODOS PARA AS TAREFAS
  // ==========================================
  async adicionarPrazo(novoPrazo: NovoPrazo) {
    this.listaDePrazos.push({ ...novoPrazo, estado: 'Pendente' });
    await this.storage.set('meus_prazos', this.listaDePrazos);
  }

  async atualizarEstadoTarefas() {
    await this.storage.set('meus_prazos', this.listaDePrazos);
  }

  // ==========================================
  // MÉTODOS PARA OS GRUPOS
  // ==========================================
  async adicionarGrupo(grupo: any) {
    this.listaGrupos.push(grupo);
    await this.storage.set('meus_grupos', this.listaGrupos);
  }

  async removerGrupo(grupoParaApagar: any) {
    this.listaGrupos = this.listaGrupos.filter(g => g !== grupoParaApagar);
    await this.storage.set('meus_grupos', this.listaGrupos);
  }
  // Adiciona a nova tarefa à lista principal
  adicionarTarefa(novaTarefa: NovoPrazo) {
    this.listaDePrazos.push(novaTarefa);
  }
}
