const CHAVE_SOCIOS = 'clubeTiroSocios';
const CHAVE_TREINOS = 'clubeTiroTreinos';

function ler(chave) {
    try {
        return JSON.parse(localStorage.getItem(chave)) || [];
    } catch (erro) {
        return [];
    }
}

function salvar(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function escapar(texto) {
    return String(texto ?? '').replace(/[&<>'"]/g, caractere => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[caractere]));
}

function iniciarLogin() {
    const formulario = document.getElementById('form-login');
    if (!formulario) return;

    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const senha = document.getElementById('senha').value.trim();
        const mensagem = document.getElementById('mensagem-login');

        if (!usuario || !senha) {
            mensagem.textContent = 'Preencha usuário e senha para continuar.';
            mensagem.className = 'mensagem erro';
            return;
        }

        sessionStorage.setItem('usuarioLogado', usuario);
        window.location.href = 'menu.html';
    });
}

function iniciarCadastro() {
    const formulario = document.getElementById('form-cadastro');
    if (!formulario) return;

    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        const dados = Object.fromEntries(new FormData(formulario).entries());
        const socios = ler(CHAVE_SOCIOS);
        const jaExiste = socios.some(socio => socio.cpf === dados.cpf);
        const mensagem = document.getElementById('mensagem-cadastro');

        if (jaExiste) {
            mensagem.textContent = 'Já existe um sócio cadastrado com este CPF.';
            mensagem.className = 'mensagem erro';
            return;
        }

        dados.id = Date.now();
        dados.dataCadastro = new Date().toLocaleDateString('pt-BR');
        socios.push(dados);
        salvar(CHAVE_SOCIOS, socios);
        sessionStorage.setItem('ultimoSocio', JSON.stringify(dados));
        window.location.href = 'confirmacao.html?tipo=cadastro';
    });
}

function preencherConsulta() {
    const corpo = document.getElementById('corpo-tabela');
    if (!corpo) return;
    const socios = ler(CHAVE_SOCIOS);
    const busca = document.getElementById('busca-socio');

    function renderizar() {
        const termo = (busca?.value || '').toLowerCase();
        const filtrados = socios.filter(socio =>
            `${socio.nome} ${socio.cpf} ${socio.modalidade}`.toLowerCase().includes(termo)
        );

        if (!filtrados.length) {
            corpo.innerHTML = '<tr><td colspan="5" class="lista-vazia">Nenhum sócio encontrado.</td></tr>';
            return;
        }

        corpo.innerHTML = filtrados.map(socio => `
            <tr>
                <td>${escapar(socio.nome)}</td>
                <td>${escapar(socio.cpf)}</td>
                <td>${escapar(socio.modalidade)}</td>
                <td>${escapar(socio.telefone)}</td>
                <td>${escapar(socio.dataCadastro)}</td>
            </tr>
        `).join('');
    }

    busca?.addEventListener('input', renderizar);
    renderizar();
}

function iniciarTreino() {
    const formulario = document.getElementById('form-treino');
    if (!formulario) return;

    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        const dados = Object.fromEntries(new FormData(formulario).entries());
        const treinos = ler(CHAVE_TREINOS);
        dados.id = Date.now();
        dados.data = new Date().toLocaleDateString('pt-BR');
        treinos.push(dados);
        salvar(CHAVE_TREINOS, treinos);
        sessionStorage.setItem('ultimoTreino', JSON.stringify(dados));
        window.location.href = 'confirmacao.html?tipo=treino';
    });
}

function preencherConfirmacao() {
    const titulo = document.getElementById('titulo-confirmacao');
    const detalhe = document.getElementById('detalhe-confirmacao');
    if (!titulo || !detalhe) return;

    const tipo = new URLSearchParams(window.location.search).get('tipo');
    if (tipo === 'treino') {
        const treino = JSON.parse(sessionStorage.getItem('ultimoTreino') || '{}');
        titulo.textContent = 'Treino registrado com sucesso!';
        detalhe.textContent = `Sessão de ${treino.modalidade || 'treino'} registrada para ${treino.nome || 'o sócio'} em ${treino.data || 'hoje'}.`;
    } else {
        const socio = JSON.parse(sessionStorage.getItem('ultimoSocio') || '{}');
        titulo.textContent = 'Sócio cadastrado com sucesso!';
        detalhe.textContent = `${socio.nome || 'O novo sócio'} já aparece na tela de consulta.`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarLogin();
    iniciarCadastro();
    preencherConsulta();
    iniciarTreino();
    preencherConfirmacao();

    const usuario = sessionStorage.getItem('usuarioLogado');
    document.querySelectorAll('[data-usuario]').forEach(elemento => {
        elemento.textContent = usuario || 'instrutor';
    });
});
