# Gerenciamento de Alunos Lambda

## Descrição

Esta função Lambda é responsável por gerenciar o cadastro e a manipulação de dados de alunos na plataforma. Ela permite a inserção, atualização, exclusão e listagem de alunos no banco de dados PostgreSQL.

## Endpoints

- **POST /students**: Cadastra um novo aluno.
- **GET /students**: Lista todos os alunos.
- **GET /students/{id}**: Obtém um aluno específico pelo ID.
- **PUT /students/{id}**: Atualiza os dados de um aluno.
- **DELETE /students/{id}**: Exclui um aluno.

## Pré-requisitos

- PostgreSQL deve estar acessível com as tabelas necessárias criadas.

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão para o banco de dados PostgreSQL.

## Exemplo de Corpo de Requisição para Cadastro (POST /students)

```json
{
  "name": "Maria Oliveira",
  "email": "maria.oliveira@example.com",
  "phone": "+5511988888888",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
