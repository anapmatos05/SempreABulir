import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, docData, 
  addDoc, query, where, getDocs, updateDoc, deleteDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private firestore: Firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  getDetalhesGrupo(grupoId: string): Observable<any> {
    return docData(doc(this.firestore, `grupos/${grupoId}`), { idField: 'id' });
  }

  getSubtarefas(grupoId: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, `grupos/${grupoId}/subtarefas`), 
      { idField: 'id' }
    );
  }

  getGruposAtivos(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'grupos'), { idField: 'id' });
  }

  async adicionarSubtarefa(grupoId: string, dadosTarefa: any) {
    return runInInjectionContext(this.injector, () => 
      addDoc(collection(this.firestore, `grupos/${grupoId}/subtarefas`), dadosTarefa)
    );
  }

  // 🚀 NOVO: Atualizar o estado de uma subtarefa (Visto / Não Visto)
  async atualizarSubtarefa(grupoId: string, tarefaId: string, dados: any): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      updateDoc(doc(this.firestore, `grupos/${grupoId}/subtarefas/${tarefaId}`), dados)
    );
  }

  async criarGrupo(grupoData: any): Promise<void> {
    await runInInjectionContext(this.injector, () => 
      addDoc(collection(this.firestore, 'grupos'), grupoData)
    );
  }

  // 🚀 NOVO: Atualizar um grupo (Nome, Membros, Chat, Ficheiros, Progresso)
  async atualizarGrupo(grupoId: string, dados: any): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      updateDoc(doc(this.firestore, `grupos/${grupoId}`), dados)
    );
  }

  // 🚀 NOVO: Apagar um grupo inteiro da nuvem
  async apagarGrupo(grupoId: string): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      deleteDoc(doc(this.firestore, `grupos/${grupoId}`))
    );
  }

  async procurarUtilizadores(termo: string): Promise<any[]> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(
        collection(this.firestore, 'utilizadores'),
        where('nomeLower', '>=', termo.toLowerCase()),
        where('nomeLower', '<=', termo.toLowerCase() + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });
  }
}