# Roadmap e Status do Projeto

## Status Atual

- **Fase:** Implementação do Backend e Preparação para Self-Hosting.
- **Última Atualização:** 12 de Dezembro de 2025.

## Em Progresso

- [ ] Configuração inicial do Backend em Go.
- [ ] Definição da arquitetura do banco de dados SQLite.
- [ ] Criação do Dockerfile unificado (Frontend + Backend).

## Próximos Passos (Backlog)

1.  **Backend (Go + SQLite):**
    - Criar servidor API em Go.
    - Implementar persistência com SQLite (substituindo `localStorage`).
    - Criar endpoints para sincronização de dados dos widgets.
2.  **Deployment (Self-Hosted):**
    - Criar Dockerfile multi-stage para build do React e execução do binário Go.
    - Garantir compatibilidade com CasaOS/ZimaOS.
3.  **Refatoração de Estado:** Migrar de `App.tsx` + `localStorage` para consumo da API.
4.  **Validação de Dados:** Implementar validação (Zod) no frontend e validação correspondente no backend.
5.  **Novos Widgets:**
    - [ ] **Widget de Finanças:**
      - Entradas e Saídas manuais.
      - Categorização simples (Alimentação, Transporte, Lazer, etc.).
      - Visualização de saldo mensal.
    - [ ] Widget de Clima/Tempo.

## Histórico Recente

- Criação da estrutura de documentação `.vscode/instructions`.
