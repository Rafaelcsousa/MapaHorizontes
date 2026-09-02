# Ideias Futuras — Mapa Estratégico

Este documento registra ideias, expansões de escopo e diretrizes de evolução do projeto **Mapa Estratégico**.

---

## 1. Detalhamento Progressivo de Projetos (do Receptivo ao Técnico)

### Conceito
- Os projetos devem iniciar com um cadastro rápido, simples, agradável e receptivo para que qualquer usuário (gestores, coordenadores, colaboradores) possa sugerir uma ideia sem barreiras técnicas ou formulários extensos.
- Conforme o projeto evolui pelos Horizontes ou é selecionado para desenvolvimento, o sistema deve permitir o detalhamento progressivo das especificações.

### Recursos Futuros
- **Formulários Destinados à Equipe de Desenvolvimento**:
  - Mapeamento de funções internas e módulos técnicos.
  - Definição de tabelas, coleções e esquemas de banco de dados.
  - Mapeamento de APIs externas, dependências de infraestrutura e serviços necessários.
  - Definição de requisitos não funcionais (segurança, performance, volume de dados).
- **Linha do Tempo e Diálogos Técnicos**:
  - Registro de especificações arquiteturais e especificações técnicas dentro da linha do tempo (`dialogos`).

---

## 2. Relatórios Automáticos de Integração Estratégica

### Conceito
- Quando um novo projeto ou ideia for sugerido, o sistema (via **Strategic Agent**) gerará automaticamente um **Relatório de Sugestões de Integração**.

### Conteúdo do Relatório
- **Encaixe nos Caminhos Existentes**: Como a nova proposta se conecta com os caminhos centrais e projetos que já estão rodando (Horizonte 1 e 2).
- **Impacto em Projetos Centrais**: Identificação de quais projetos centrais operacionais serão beneficiados ou alavancados pela nova ideia.
- **Sugestão de Sequenciamento**: Ordem recomendada de execução (ex: se o novo projeto exige uma funcionalidade que um projeto em andamento já está criando).
- **Relatório de Sinergias e Riscos**: Pontos de sobreposição com iniciativas em andamento para evitar retrabalho.

---

## 3. Evolução do Agente Estratégico (Camada Semântica & LLM)

- **Camada Semântica Local (WebGPU / Embeddings Locais)**: Suporte opcional a modelos pequenos no navegador para busca semântica aproximada.
- **Pesquisa Externa e Síntese (LLM)**: Conectores opcionais para serviços externos de pesquisa estratégica sobre tecnologias emergentes e benchmarks de mercado.
