# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, armazenando os arquivos no filesystem local e mantendo os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos do usuário identificado na requisição.
- Download de um documento pelo identificador, somente pelo seu dono.
- Armazenamento de arquivos local com Multer e `diskStorage`.
- Metadados mantidos em memória durante a execução do processo.
- Interface web para os fluxos de upload, listagem e download.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Banco de dados ou persistência dos metadados entre reinicializações.
- Autenticação, cadastro e gestão de contas de usuário.
- Versionamento, edição, exclusão ou compartilhamento de documentos.
- Busca avançada, pastas e permissões configuráveis.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo enviado como `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve associar o documento ao usuário identificado pelo cabeçalho `X-User-Id`. |
| RF-03 | O sistema deve gerar um identificador único para cada documento. |
| RF-04 | O sistema deve armazenar o arquivo no filesystem local, usando Multer com `diskStorage`. |
| RF-05 | O sistema deve registrar os metadados do documento em memória após o armazenamento do arquivo. |
| RF-06 | O usuário deve poder listar somente os documentos associados ao seu identificador. |
| RF-07 | A listagem deve retornar documentos em ordem decrescente de data de upload. |
| RF-08 | O usuário deve poder baixar um documento pelo identificador se for seu dono. |
| RF-09 | Uma listagem sem documentos deve retornar sucesso com uma lista vazia. |
| RF-10 | O sistema deve responder a erros com status HTTP apropriado e mensagem sem detalhes internos. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O armazenamento dos arquivos deve ser local; não utilizar provedores externos. |
| RNF-02 | Multer deve usar `diskStorage`; nomes físicos devem ser gerados pelo sistema, sem confiar no nome enviado. |
| RNF-03 | Os metadados devem permanecer em memória e podem ser perdidos ao reiniciar o processo. |
| RNF-04 | A configuração deve usar variáveis de ambiente, incluindo porta e limite de tamanho do upload. |
| RNF-05 | O limite de tamanho deve ser finito e configurável; valor inicial proposto: 10 MiB. |
| RNF-06 | O nome original deve ser preservado como metadado, mas não usado como caminho de armazenamento. |
| RNF-07 | A API deve evitar expor caminhos locais, stack traces ou detalhes internos em respostas de erro. |
| RNF-08 | A interface deve consumir a API pelo prefixo `/api`, conforme convenção do projeto. |

## 5. Modelo de dados

Registro de metadados mantido em memória:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único, preferencialmente UUID. |
| `originalName` | string | Nome original fornecido no upload. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador recebido em `X-User-Id`. |
| `storageName` | string | Nome físico gerado pelo sistema; uso interno, não retornado pela API. |

O caminho físico é formado a partir do diretório local configurado e do `storageName`. O registro público da API não deve incluir esse caminho nem o nome físico.

## 6. Contratos de API

A interface acessa os endpoints pelo proxy `/api`. Os caminhos abaixo são relativos ao backend.

Formato de erro comum:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Descrição segura e compreensível do erro."
  }
}
```

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id`.
- Entrada: `multipart/form-data`, campo de arquivo `file`.
- Sucesso: `201 Created`, corpo com os metadados públicos do documento.
- Erros: `400` para usuário ou arquivo ausente/inválido; `413` para arquivo acima do limite; `500` para falha inesperada de armazenamento.
- Se o registro em memória falhar após gravar o arquivo, o arquivo recém-gravado deve ser removido para evitar órfão.

Exemplo de sucesso:

```json
{
  "id": "uuid",
  "originalName": "relatorio.pdf",
  "size": 12345,
  "uploadedAt": "2026-11-04T12:00:00.000Z",
  "owner": "usuario-123"
}
```

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, lista de metadados públicos pertencentes ao usuário.
- Lista vazia: `200 OK` com `[]`.
- Erros: `400` se o identificador do usuário estiver ausente; `500` para falha inesperada.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário do arquivo; enviar `Content-Disposition` com o nome original e um tipo de conteúdo apropriado, ou `application/octet-stream` como fallback.
- Erros: `400` para identificador inválido ou usuário ausente; `404` se o documento não existir, não pertencer ao usuário ou o arquivo não estiver disponível; `500` para falha inesperada de leitura.
- A resposta não deve revelar se um documento pertencente a outro usuário existe.

## 7. Decisões arquiteturais e riscos

- Backend em CommonJS e Express, com dependência direcionada `routes -> controllers -> services -> repositories`.
- Rotas encaminham requisições; controllers tratam HTTP e validação básica; services aplicam regras de negócio; repositories controlam metadados e filesystem.
- Multer com `diskStorage` grava exclusivamente no filesystem local. O diretório padrão é `backend/storage`; sua configuração pode usar uma variável de ambiente mantendo a restrição de armazenamento local.
- O nome físico deve ser gerado pelo sistema. `originalName` nunca deve determinar diretório ou caminho.
- Metadados em memória são voláteis: reiniciar o processo pode deixar arquivos sem registro. Reconciliação e persistência não fazem parte desta fase.
- `X-User-Id` identifica o usuário para o MVP, mas não autentica nem comprova sua identidade. Não é mecanismo adequado para produção sem autenticação confiável.
- O frontend usa React e `fetch`, com requisições sob `/api`; o proxy de desenvolvimento encaminha ao backend.

## 8. Plano de execução em etapas

Este plano define marcos funcionais e critérios, não tarefas de alteração de arquivos de backend ou frontend. A entrega desta etapa é somente `docs/specs/dms-spec.md`.

1. **Consolidar a especificação**  
   Arquivo: criar `docs/specs/dms-spec.md`.  
   Aceite: objetivo, escopo, requisitos funcionais e não funcionais, modelo de dados, contratos, decisões e riscos estão documentados.

2. **Validar contratos e restrições**  
   Arquivo: revisar `docs/specs/dms-spec.md`.  
   Aceite: os contratos definem entradas, respostas, status de erro e propriedade dos documentos; o armazenamento local com Multer e metadados em memória está explícito.

3. **Registrar os critérios para implementação futura**  
   Arquivo: atualizar `docs/specs/dms-spec.md` se a revisão encontrar lacunas.  
   Aceite: o plano não autoriza nem inclui execução de arquivos de backend ou frontend; qualquer implementação desses componentes fica para uma etapa posterior.