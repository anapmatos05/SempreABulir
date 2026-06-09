import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { query, getDocs, where } from '@angular/fire/firestore';

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

  // 4. Criar um novo grupo do zero na base de dados
  async criarGrupo(dadosGrupo: any) {
    const gruposRef = collection(this.firestore, 'grupos');
    return await addDoc(gruposRef, dadosGrupo);
  }

  // Vai à coleção 'users' procurar nomes que comecem pelo que escreveste
  async procurarUtilizadores(termo: string) {
    if (!termo) return [];
    
    // Assumimos que a coleção da Ana se chama 'users'. Se for 'utilizadores', altera aqui!
    const usersRef = collection(this.firestore, 'users'); 
    
    // Truque do Firebase para procurar palavras que começam com o "termo"
    const q = query(
      usersRef, 
      where('nome', '>=', termo), 
      where('nome', '<=', termo + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const resultados: any[] = [];
    
    querySnapshot.forEach((doc) => {
      // Guarda o ID único do Firebase junto com os dados da pessoa
      resultados.push({ id: doc.id, ...doc.data() }); 
    });

    return resultados;
  }
}