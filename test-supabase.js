const { createClient } = require('@supabase/supabase-js');
const db = createClient('https://aymdooyafimliiggxeqs.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bWRvb3lhZmltbGlpZ2d4ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDUxNDksImV4cCI6MjEwMDY4MTE0OX0.-NBhiyGDlrWq4QKNLx9Ll5GlIk0mV_rBWnr0vdbUCOU');

async function run() {
  const { data, error } = await db.from('app_atendimento_fraterno').insert([{
      nome_completo: 'Teste',
      endereco_completo: 'Teste',
      data_nascimento: '1990-01-01',
      telefone: '11999999999',
      status: 'Pendente',
      criado_por: 'Site Externo'
  }]);
  console.log(JSON.stringify(error, null, 2));
}
run();
