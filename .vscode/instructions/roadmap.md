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
    - [x] **Widget Wiki (Markdown Avançado):**
      - [x] Editor Markdown com suporte a múltiplas abas.
      - [x] **Compartilhamento Público:** Botão para gerar link público (Read-Only) via UUID.
      - [x] **Identificação Visual:** Ícone (ex: globo) para abas públicas.
      - [x] **Frontend Dedicado:** Rota específica (ex: `/wiki/:uuid`) para renderização limpa da página compartilhada.
      - [x] **Backend:** Rotas públicas para servir o conteúdo sem autenticação via hash.
      - [ ] **Melhoria Markdown:** Adicionar suporte completo a Markdown (negrito, links, imagens, tabelas) usando `react-markdown` e `@tailwindcss/typography`.
    - [ ] Widget de Clima/Tempo.
6.  **Melhorias de Funcionalidades:**
    - [ ] **Notificações Push para Lembretes:** Integrar o widget de Reminder com o sistema de Web Push do backend.
    - [ ] **Segurança de IA:** Migrar a lógica do `geminiService` (Frontend) para o Backend (Go) para proteger as chaves de API e centralizar as requisições.
    - [ ] Aba de changelog

## Histórico Recente

- Criação da estrutura de documentação `.vscode/instructions`.
