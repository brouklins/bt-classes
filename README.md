# Gerenciamento de Contratos Lambda

## Descrição

Esta função Lambda é responsável por gerenciar o cadastro e a manipulação de dados de contratos na plataforma. Ela permite a inserção, atualização, exclusão e listagem de contratos no banco de dados PostgreSQL.

## Endpoints

- **POST /contracts**: Cadastra um novo contrato.
- **GET /contracts**: Lista todos os contratos.
- **GET /contracts/{id}**: Obtém um contrato específico pelo ID.
- **PUT /contracts/{id}**: Atualiza os dados de um contrato.
- **DELETE /contracts/{id}**: Exclui um contrato.

## Pré-requisitos

- PostgreSQL deve estar acessível com as tabelas necessárias criadas.

## Variáveis de Ambiente

- `DATABASE_URL`: URL de conexão para o banco de dados PostgreSQL.

## Exemplo de Corpo de Requisição para Cadastro (POST /contracts)

```json
{
  "student_id": "123e4567-e89b-12d3-a456-426614174000",
  "instructor_id": "123e4567-e89b-12d3-a456-426614174000",
  "start_date": "2025-01-20",
  "days_of_week": ["monday", "thursday"],
  "status": "ACTIVE"
}
