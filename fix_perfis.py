import re

files = [
    '/Users/wagnercosta/Documents/antigravity/portal-sela/m_atendimento_pedido.js',
    '/Users/wagnercosta/Documents/antigravity/portal-sela/atendimento_pedido.js'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We want to add `perfis: ['Paciente'],` right after `cpf_provisorio: true,`
    content = re.sub(
        r"cpf_provisorio:\s*true,",
        r"cpf_provisorio: true,\n                    perfis: ['Paciente'],",
        content
    )
    
    with open(file, 'w') as f:
        f.write(content)
