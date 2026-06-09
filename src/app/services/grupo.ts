import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // É esta linha mágica que transforma o ficheiro num Serviço!
})
export class GrupoService {
  private firestore: Firestore = inject(Firestore); // Injeta a base de dados da Ana

  constructor() { }

  // 1. Ir buscar os dados principais do grupo (Nome, membros, etc)
  getDetalhesGrupo(grupoId: string): Observable<any> {
    const grupoRef = doc(this.firestore, `grupos/${grupoId}`);
    return docData(grupoRef, { idField: 'id' });
  }

  // 2. Ouvir as subtarefas em TEMPO REAL (Se o Afonso alterar, tu vês logo)
  getSubtarefas(grupoId: string): Observable<any[]> {
    const subtarefasRef = collection(this.firestore, `grupos/${grupoId}/subtarefas`);
    return collectionData(subtarefasRef, { idField: 'id' });
  }

  // 3. Criar uma nova subtarefa e enviar para a nuvem
  async adicionarSubtarefa(grupoId: string, dadosTarefa: any) {
    const subtarefasRef = collection(this.firestore, `grupos/${grupoId}/subtarefas`);
    return await addDoc(subtarefasRef, dadosTarefa);
  }
}