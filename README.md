Projeto Raizes do Nordeste

Disciplina de Projeto Multidisciplinar — Trilha: Back-End

Requisitos Técnicos Detalhados: Especificação de versões do Node.js, gerenciador de pacotes (npm), banco de dados PostgreSQL (Supabase) e compilador TypeScript.

Configuração de Variáveis de Ambiente: Instruções claras sobre como duplicar o arquivo .env.example e configurar as chaves essenciais do projeto (como a DATABASE_URL do Supabase e o JWT_SECRET).

Instalação de Dependências: Comandos e explicação para baixar as bibliotecas principais (Express, Prisma, JWT, Bcrypt, CORS, Swagger).

Persistência Real, Migrations e Seed: Guia detalhado de como gerar o Prisma Client (prisma generate), executar as migrations para criar as 10 tabelas físicas no Supabase (prisma migrate dev) e rodar a carga inicial de dados (prisma db seed).

Inicialização da API: Comandos para rodar o projeto tanto em ambiente de desenvolvimento (com hot-reload usando ts-node-dev) quanto compilado para produção.

Acesso à Documentação Viva (Swagger UI): URLs de acesso locais e exemplo de produção para testar os endpoints interativamente no navegador.

Execução do Plano de Testes (10 Cenários): Instruções de como importar a coleção do Postman (postman_collection.json), configurar tokens Bearer JWT e executar a ordem correta das pastas de teste (Auth, Produtos, Pedidos, Pagamento e Erros)

