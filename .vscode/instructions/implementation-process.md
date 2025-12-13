# Processo de Implementação e Padrões

## Workflow de Desenvolvimento

1.  **Análise:** Antes de codificar, entenda o requisito e identifique quais componentes ou tipos precisam ser alterados.
2.  **Tipagem:** Se for um novo Widget ou alteração de dados, comece atualizando `types.ts`.
3.  **Componente:** Crie ou edite o componente em `components/widgets/`.
4.  **Integração:** Registre o novo widget em `App.tsx` (lista de widgets disponíveis) e `Dashboard.tsx` (renderização), se necessário.
5.  **Estilização:** Use Tailwind CSS. Mantenha consistência com o tema Dark/Light.
6.  **Testes Manuais:** Verifique a persistência dos dados no `localStorage` e a responsividade.
7.  **Documentação:** Verifique se a alteração requer atualização no `README.md` (ex: novas variáveis de ambiente, rotas de API, mudanças de segurança ou setup).

## Padrões de Código

- **Componentes Funcionais:** Use React Hooks (`useState`, `useEffect`, etc.).
- **Props:** Defina interfaces claras para as props dos componentes.
- **Imutabilidade:** Ao atualizar o estado global em `App.tsx`, certifique-se de criar novas cópias dos objetos/arrays.
- **Tratamento de Erros:** Especialmente em chamadas de API (IA), use `try/catch` e forneça feedback visual ao usuário.

## Contexto para IA (Copilot)

- Ao pedir ajuda, mencione qual Widget está sendo trabalhado.
- Se houver erro, forneça o stack trace ou comportamento observado.
- Mantenha o arquivo `roadmap.md` atualizado para que a IA saiba o status do projeto.
- **Sempre verifique se a implementação atual afeta o `README.md` e sugira a atualização se necessário.**
