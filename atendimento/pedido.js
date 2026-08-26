(function() {
    // Inicialização do Supabase usando as chaves locais (formulário aberto)
    const SUPABASE_URL = 'https://aymdooyafimliiggxeqs.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bWRvb3lhZmltbGlpZ2d4ZXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDUxNDksImV4cCI6MjEwMDY4MTE0OX0.-NBhiyGDlrWq4QKNLx9Ll5GlIk0mV_rBWnr0vdbUCOU';
    const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('formAtendimento');
        form.addEventListener('submit', salvarPedido);

        // Máscara de telefone
        const telefoneInput = document.getElementById('inTelefone');
        telefoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    });

    async function salvarPedido(e) {
        e.preventDefault();

        const btnSalvar = document.getElementById('btnSalvar');
        btnSalvar.disabled = true;
        btnSalvar.innerText = 'Enviando...';

        const nome = document.getElementById('inNome').value.trim();
        const endereco = document.getElementById('inEndereco').value.trim();
        const nascimento = document.getElementById('inNascimento').value;
        const telefone = document.getElementById('inTelefone').value.trim();

        try {
            let pacienteId = null;

            // 1. Tentar encontrar o paciente por nome e data de nascimento
            if (nascimento) {
                const { data: pes } = await db.from('pessoas')
                    .select('id')
                    .ilike('nome_completo', nome)
                    .eq('data_nascimento', nascimento)
                    .limit(1);
                if (pes && pes.length > 0) pacienteId = pes[0].id;
            }
            
            // 2. Se não achou, tentar por nome e telefone
            if (!pacienteId && telefone) {
                const { data: pes2 } = await db.from('pessoas')
                    .select('id')
                    .ilike('nome_completo', nome)
                    .eq('celular', telefone)
                    .limit(1);
                if (pes2 && pes2.length > 0) pacienteId = pes2[0].id;
            }

            // 3. Se não existe, gerar CPF provisório e criar
            if (!pacienteId) {
                const { data: usedData } = await db.from('pessoas').select('cpf_cnpj').like('cpf_cnpj', '111111%');
                const usedSet = new Set(usedData ? usedData.map(d => d.cpf_cnpj ? d.cpf_cnpj.replace(/\D/g, '') : '') : []);
                let fakeCpf = null;
                for (let i = 1; i <= 9999; i++) {
                    const candidate = '111111' + String(i).padStart(5, '0');
                    if (!usedSet.has(candidate)) {
                        fakeCpf = candidate;
                        break;
                    }
                }
                if (!fakeCpf) fakeCpf = '11111199999';

                const { data: pessoaData, error: pessoaError } = await db.from('pessoas').insert([{
                    nome_completo: nome,
                    nome_curto: nome.split(' ')[0],
                    data_nascimento: nascimento || null,
                    celular: telefone,
                    endereco: endereco,
                    cpf_cnpj: fakeCpf,
                    cpf_provisorio: true,
                    perfis: ['Paciente'],
                    status: 'Ativo'
                }]).select('id').single();

                if (pessoaError) throw pessoaError;
                pacienteId = pessoaData.id;
            }

            // 4. Criar a solicitação de atendimento vinculando o paciente
            const { error: atendimentoError } = await db.from('app_atendimento_fraterno').insert([{
                nome_completo: nome,
                paciente_id: pacienteId,
                status: 'Pendente',
                criado_por: 'Site Externo'
            }]);

            if (atendimentoError) throw atendimentoError;

            // Mostrar mensagem de sucesso
            document.getElementById('formAtendimento').style.display = 'none';
            document.getElementById('successBox').style.display = 'block';

        } catch (error) {
            console.error('Erro ao salvar solicitação:', error);
            Swal.fire({
                icon: 'error',
                title: 'Ops...',
                text: 'Não foi possível enviar sua solicitação. Tente novamente mais tarde.',
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#f8fafc'
            });
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerText = 'Solicitar Atendimento';
        }
    }

    window.novaSolicitacao = function() {
        document.getElementById('formAtendimento').reset();
        document.getElementById('successBox').style.display = 'none';
        document.getElementById('formAtendimento').style.display = 'block';
    }
})();
