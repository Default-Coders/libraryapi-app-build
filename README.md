# Backend NestJS — Biblioteca da ETE Integral

Reimplementação do backend Java com PostgreSQL, TypeORM, sessão HTTP persistida no banco e contratos compatíveis com o frontend existente.

## Execução

```powershell
Copy-Item .env.example .env
npm install
npm run start:dev
```

A API fica em `http://localhost:8080/api`. Com Docker: `docker compose up --build -d`.

Os nomes internos usam português do Brasil. Os campos JSON públicos continuam iguais aos do Java para não quebrar o frontend, e o cookie conserva o nome `JSESSIONID`.

As entidades usam as mesmas tabelas `tb_*`. Ao apontar para uma base restaurada do Java, configure `DATABASE_SYNCHRONIZE=false` após validar o esquema.

Verificação: `npm run build`, `npm run lint` e `npm test`.
