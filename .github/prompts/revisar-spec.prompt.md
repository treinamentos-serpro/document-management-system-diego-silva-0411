---
description: Revisa e completa a especificação do Document Management System.
name: revisar-spec
argument-hint: caminho da especificação (ex. docs/specs/dms-spec.md)
agent: agent
---

# Revisar especificação do DMS

Revise a especificação `${input:especificacao:caminho da especificação}` usando como referência `docs/specs/spec-template.md`, `.github/copilot-instructions.md` e a estrutura atual do projeto.

Atualize somente o arquivo de especificação indicado. Não crie nem altere arquivos de backend, frontend, testes, configurações ou documentação adicional.

Verifique se o documento define claramente:

- Objetivo, escopo e itens explicitamente fora do escopo.
- Requisitos funcionais e não funcionais identificados por IDs estáveis.
- Modelo de dados dos metadados, distinguindo campos públicos de dados internos de armazenamento.
- Contratos dos endpoints `POST /upload`, `GET /documents` e `GET /documents/:id/download`, incluindo entradas, respostas de sucesso, erros HTTP e propriedade dos documentos.
- Clean Architecture simples no backend, com fluxo `routes -> controllers -> services -> repositories`.
- Uso exclusivo do filesystem local em `backend/storage`, com Multer e `diskStorage`; metadados em memória nesta fase.
- Uso de variáveis de ambiente e premissas, limitações e riscos relevantes.
- Plano de execução ordenado, com etapas e critérios de aceite.

Regras para a revisão:

- Preserve as decisões e convenções já estabelecidas no projeto; não invente requisitos sem identificá-los como propostas ou premissas.
- Não proponha armazenamento externo, banco de dados, versionamento ou autenticação fora do escopo existente sem registrar isso como decisão futura.
- O plano deve se limitar à especificação e à preparação dos critérios. Não inclua tarefas para implementar ou executar arquivos de backend ou frontend.
- Mantenha o documento conciso, verificável e escrito em português.
- Ao terminar, informe brevemente as seções atualizadas e as premissas que ainda precisam de decisão.