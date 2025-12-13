# Visão Geral do Projeto LifeHub

## Objetivo

O **LifeHub** é um painel pessoal (Dashboard) centralizado para produtividade, saúde e organização, utilizando uma arquitetura de Widgets modulares.

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Go (Golang)
- **Banco de Dados:** SQLite
- **Deployment:** Docker (Single Container para Self-Hosting)
- **Estilização:** Tailwind CSS (com suporte a Dark Mode)
- **Ícones:** Lucide React
- **IA:** Integração com Google Gemini, OpenAI e Anthropic via SDKs/APIs.
- **Persistência:** Migração de `localStorage` para SQLite via API Go.

## Arquitetura de Dados

- **Core:** `types.ts` define a interface `WidgetData`.
- **Estado Global:** Gerenciado em `App.tsx`, persistido no `localStorage`.
- **Layout:** Grid responsivo gerenciado por `Dashboard.tsx`.

## Estrutura de Pastas

- `cmd/server/`: Ponto de entrada do servidor Go (`main.go`).
- `internal/`: Código do backend (API, Models, Database).
- `web/`: Código fonte do Frontend (React).
  - `src/`: Componentes e lógica do React.
  - `components/`: Componentes React.
  - `services/`: Serviços de integração.
- `go.mod`: Definição do módulo Go.
- `Dockerfile`: Configuração de build multi-stage (Frontend + Backend).

## Widgets Principais

- **Produtividade:** Todo, Kanban, Notes, Pomodoro, Links.
- **Saúde:** Wellness (Hidratação), GymTrack (Treinos), Diet (Nutrição).
- **IA:** AICoach (Chat contextual).
