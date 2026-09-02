import { Projeto } from '../types';
import { StrategicPathSequence } from './types';

export class PathEngine {
  /**
   * Constrói caminhos estratégicos sequenciais de projetos encadeados (Horizonte 1 -> Horizonte 2 -> Horizonte 3)
   */
  public static constructStrategicPaths(projetos: Projeto[]): StrategicPathSequence[] {
    const h1List = projetos.filter(p => p.horizonte === 1);
    const h2List = projetos.filter(p => p.horizonte === 2);
    const h3List = projetos.filter(p => p.horizonte === 3);

    const sequencias: StrategicPathSequence[] = [];

    h1List.forEach(h1 => {
      // Procura projeto H2 conectado
      const relH2 = (h1.relacoes || []).find(r => h2List.some(h2 => h2.id === r.projetoDestinoId));
      if (relH2) {
        const h2 = h2List.find(p => p.id === relH2.projetoDestinoId);
        if (h2) {
          // Procura projeto H3 conectado a H2
          const relH3 = (h2.relacoes || []).find(r => h3List.some(h3 => h3.id === r.projetoDestinoId));
          const h3 = relH3 ? h3List.find(p => p.id === relH3.projetoDestinoId) : undefined;

          const envolvidos = [
            { id: h1.id, titulo: h1.titulo, horizonte: h1.horizonte, complexidade: h1.complexidadeOperacional },
            { id: h2.id, titulo: h2.titulo, horizonte: h2.horizonte, complexidade: h2.complexidadeOperacional },
          ];

          if (h3) {
            envolvidos.push({ id: h3.id, titulo: h3.titulo, horizonte: h3.horizonte, complexidade: h3.complexidadeOperacional });
          }

          const compTot = envolvidos.reduce((acc, curr) => acc + curr.complexidade, 0);

          sequencias.push({
            tituloCaminho: `Caminho Estratégico: ${h1.titulo} → ${h2.titulo}${h3 ? ' → ' + h3.titulo : ''}`,
            descricao: `Sequência de evolução iniciando na base operacional H1, consolidando em H2 e avançando estrategicamente.`,
            projetosEnvolvidos: envolvidos,
            complexidadeAcumulada: compTot,
            oportunidadesAlternativas: [],
          });
        }
      }
    });

    return sequencias;
  }
}
