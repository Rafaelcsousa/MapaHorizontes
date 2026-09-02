import { Projeto, ContextoNode, ConexaoContexto } from '../types';

export class C4ContextStore {
  public static readonly DEFAULT_CONTEXTS = [
    'Sistema SIGAP',
    'Portal do Aluno',
    'Mapa de Portfólio',
    'BiblioPós',
    'Inovação & IA'
  ];

  /**
   * Obtém a lista única de Contextos / Macrosistemas da base de projetos
   */
  public static getContextList(projetos: Projeto[]): string[] {
    const set = new Set<string>(this.DEFAULT_CONTEXTS);
    projetos.forEach(p => {
      if (p.contexto && p.contexto.trim()) {
        set.add(p.contexto.trim());
      }
    });
    return Array.from(set);
  }

  /**
   * Constrói os Nós de Contexto para a Visão Nível 1 C4 Model (Prezi Macro)
   */
  public static buildContextNodes(
    projetos: Projeto[],
    customPositions: Record<string, { x: number; y: number }> = {}
  ): ContextoNode[] {
    const contextNames = this.getContextList(projetos);
    const total = contextNames.length;

    return contextNames.map((nome, idx) => {
      const projsDoContexto = projetos.filter(p => (p.contexto || 'Geral').trim().toLowerCase() === nome.trim().toLowerCase());
      const nodeId = `ctx_${nome.toLowerCase().replace(/\s+/g, '_')}`;

      let pos = customPositions[nodeId];
      if (!pos) {
        // Distribuir em elipse no mapa macro (Nível 1 C4)
        const angle = (idx / Math.max(1, total)) * (2 * Math.PI) - Math.PI / 2;
        const rx = 32;
        const ry = 22;
        const cx = 50 + rx * Math.cos(angle);
        const cy = 48 + ry * Math.sin(angle);
        pos = { x: cx, y: cy };
      }

      return {
        id: nodeId,
        nome,
        quantidadeProjetos: projsDoContexto.length,
        posicao: pos,
        projetos: projsDoContexto,
      };
    });
  }

  /**
   * Calcula conexões agregadas entre Contextos diferentes (Nível 1 C4)
   */
  public static buildInterContextConnections(
    nodes: ContextoNode[],
    projetos: Projeto[]
  ): ConexaoContexto[] {
    const map = new Map<string, number>();

    projetos.forEach(pOrigem => {
      const ctxOrigem = pOrigem.contexto || 'Geral';
      (pOrigem.relacoes || []).forEach(rel => {
        const pDestino = projetos.find(p => p.id === rel.projetoDestinoId);
        if (pDestino) {
          const ctxDestino = pDestino.contexto || 'Geral';
          if (ctxOrigem.trim().toLowerCase() !== ctxDestino.trim().toLowerCase()) {
            const nodeOrigem = nodes.find(n => n.nome.trim().toLowerCase() === ctxOrigem.trim().toLowerCase());
            const nodeDestino = nodes.find(n => n.nome.trim().toLowerCase() === ctxDestino.trim().toLowerCase());
            if (nodeOrigem && nodeDestino) {
              const key = `${nodeOrigem.id}->${nodeDestino.id}`;
              map.set(key, (map.get(key) || 0) + 1);
            }
          }
        }
      });
    });

    const conexoes: ConexaoContexto[] = [];
    map.forEach((count, key) => {
      const [origemId, destinoId] = key.split('->');
      conexoes.push({ origemId, destinoId, quantidadeConexoes: count });
    });

    return conexoes;
  }

  /**
   * Identifica componentes internos e externos na Delimitação Dupla C4
   */
  public static getC4Boundaries(selectedContext: string, projetos: Projeto[]) {
    if (!selectedContext || selectedContext === 'todos') {
      return { internos: projetos, externos: [] };
    }

    const normCtx = selectedContext.trim().toLowerCase();
    const internos = projetos.filter(p => (p.contexto || 'Geral').trim().toLowerCase() === normCtx);
    const internoIds = new Set(internos.map(p => p.id));

    // Projetos externos de OUTROS contextos que possuem relação com os projetos internos
    const externoIds = new Set<string>();

    projetos.forEach(p => {
      if (!internoIds.has(p.id)) {
        // Verifica se o externo conecta a algum interno
        const conectaAInterno = (p.relacoes || []).some(r => internoIds.has(r.projetoDestinoId));
        // Ou se algum interno conecta ao externo
        const internoConectaAEle = internos.some(i => (i.relacoes || []).some(r => r.projetoDestinoId === p.id));

        if (conectaAInterno || internoConectaAEle) {
          externoIds.add(p.id);
        }
      }
    });

    const externos = projetos.filter(p => externoIds.has(p.id));

    return { internos, externos };
  }
}
