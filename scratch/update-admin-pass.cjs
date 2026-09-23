const { Client } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const client = new Client({
    connectionString: 'postgresql://postgres.aqljpprapyboiksfkfnh:dfc_etelimoeiro@aws-0-us-east-2.pooler.supabase.com:5432/postgres'
  });
  await client.connect();
  const hash = await bcrypt.hash('admin123', 10);
  await client.query('UPDATE tb_admin SET password = $1 WHERE email = $2', [hash, 'admin@biblioteca.com']);
  console.log('Senha de admin@biblioteca.com atualizada com sucesso para admin123!');
  await client.end();
})();
