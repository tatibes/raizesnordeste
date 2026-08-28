#API Raízes do Nordeste — Guia de Execução (README)

Este repositório contém a implementação do Back-End da rede de restaurantes Raízes do Nordeste. A solução foi projetada sob uma arquitetura em camadas, utilizando **Node.js, TypeScript e Prisma ORM** integrados ao banco de dados relacional **PostgreSQL (Supabase)**.

A API gerencia a multicanalidade operacional (pedidos via APP, TOTEM, BALCAO, PICKUP e WEB), controle descentralizado de estoque por unidade física, conformidade com a Lei Geral de Proteção de Dados (LGPD) e auditoria rastreável de ações sensíveis.

## 1. Requisitos do Sistema

Antes de iniciar a configuração da aplicação, certifique-se de possuir as seguintes ferramentas e versões instaladas em sua máquina de desenvolvimento:

*   **Linguagem de Programação:** Node.js (Versão recomendada: `v20.x.x` ).
*   **Gerenciador de Pacotes:** `npm` (instalado junto ao Node.js) ou `yarn`.
*   **Banco de Dados:** PostgreSQL (Instalado localmente ou instância em nuvem como **Supabase** utilizado neste projeto).
*   **Compilador:** TypeScript compiler (`tsc` instalado via dependências de desenvolvimento).

### Dependências Principais (Produção)
As dependências instaladas no projeto são:
*   `express`: Framework HTTP para rotas e controllers.
*   `@prisma/client`: Cliente de banco de dados tipado gerado a partir do schema.
*   `jsonwebtoken`: Emissão e verificação de tokens JWT para autenticação.
*   `cors`: Habilitação de requisições de origens cruzadas.
*   `swagger-ui-express`: Renderização dinâmica da documentação OpenAPI v3.
*   `dotenv`: Carregamento dinâmico de variáveis de ambiente.

## 2. Configuração das Variáveis de Ambiente

O arquivo `.env` para carregar as credenciais de infraestrutura. 

# 2.1 Instalação do Ambiente
### : Copiar o template de exemplo
Na raiz do projeto, copie o arquivo `.env.example` para gerar o seu `.env`:
```bash
cp .env.example .env
```

### 2.2 Preencher as credenciais no `.env`
Abra o arquivo `.env` gerado e preencha as variáveis conforme o exemplo abaixo:

```env
# Porta onde o servidor Express será executado localmente
PORT=5432

# String de conexão do PostgreSQL (Exemplo obtido em Settings > Database no Supabase)
DATABASE_URL="postgresql://postgres:[SUA_SENHA_AQUI]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"

# Segredo criptográfico para geração e assinatura de tokens JWT
JWT_SECRET="raizes_nordeste_segredo_super_seguro_e_longo_2026"
```

## 2.3 Instalação das Dependências

Com o Node.js configurado e na pasta raiz do repositório, instale todas as dependências de produção e de desenvolvimento descritas no `package.json` executando o comando:

```bash
npm install
```

## 2.4 Criação do Banco, Migrations e Seed

O projeto adutiliza **Prisma ORM** como ferramenta de infraestrutura para o banco de dados PostgreSQL. Para criar o esquema relacional, executar as migrations e popular os dados iniciais:

### 2.4.1 Gerar o Prisma Client
Para mapear as tabelas e tipos definidos no schema do Prisma para código TypeScript, execute:
```bash
npx prisma generate
```

### 2.4.2 Executar as Migrations
Para aplicar fisicamente as 10 tabelas relacionais no PostgreSQL do Supabase e criar o histórico de migrações no projeto, execute:
```bash
npx prisma migrate dev --name init_database
```

### 2.4.3 Executar a Carga Inicial de Dados (Seed)
O script de seed insere no banco as unidades físicas (Recife, Salvador, Fortaleza), os produtos sazonais do cardápio e os níveis de estoque correspondentes:
```bash
npx prisma db seed
```

## 3 Iniciar a API

O servidor Express foi configurado com monitoramento de alteração em tempo real (`ts-node-dev`) para desenvolvimento.

### Inicialização em Ambiente de Desenvolvimento 
Para rodar a aplicação localmente com recarregamento automático a cada alteração de código:
```bash
npm run dev
```
O console exibirá as seguintes mensagens confirmando o funcionamento:
```text
Servidor a rodar na porta 5432
Swagger UI disponível em http://localhost:5432/api-docs
```

### Inicialização em Ambiente de Produção
Para compilar o código TypeScript em JavaScript e iniciar o servidor:
```bash
npm run build
npm start
```

## 4 Acesso à Documentação (Swagger UI)

A API possui documentação viva e interativa em conformidade com o padrão OpenAPI v. Nela pode visualizar todos os modelos de dados, schemas de erro, payloads aceitos e realizar testes de requisições em tempo real.

*   **URL de Acesso Local:** [http://localhost:5432/api-docs](http://localhost:5432/api-docs) [cite: 110]
*   **URL de Produção (Deploy):** [https://raizes-nordeste-api.onrender.com/api-docs](https://raizes-nordeste-api.onrender.com/api-docs) (Substitua pela URL do seu deploy real )

## 5 Rodar os Testes

O projeto acompanha um plano de testes validando os 10 cenários mínimos (6 positivos e 4 negativos/exceções).

### Execução via Coleção do Postman (Recomendado para Avaliação)
1. Importe o arquivo `postman_collection.json` (localizado na raiz do projeto) para o seu cliente Postman ou Insomnia.
2. Certifique-se de que a API está rodando localmente na porta `5432` (ou preencha a variável global `{{baseUrl}}` com a URL do deploy).
3. Execute a coleção de requisições na ordem sugerida:
    *   **Pasta Auth:** Realize o login administrativo ou de cliente para obter o token JWT de acess.
    *   **Pasta Produtos:** Liste os produtos do cardápio por unidade.
    *   **Pasta Pedidos:** Crie um pedido informando o canal de origem (`canalPedido: "TOTEM"`) .
    *   **Pasta Pagamento:** Envie o ID do pedido para o endpoint `/pagamentos/mock` para simular a liquidação financeira com sucesso ou recusa.
    *   **Pasta Erros (Testes Negativos):** Execute os cenários de estoque insuficiente (retorno `409 Conflict`), credenciais inválidas (retorno `401 Unauthorized`) e rota protegida acessada por cliente (retorno `403 Forbidden`).

