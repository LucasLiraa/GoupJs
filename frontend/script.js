window.onload = function() {
    var usuarioLogado = localStorage.getItem('usuarioLogado');
    var horaLogin = localStorage.getItem('horaLogin');
    var tempoMaximo = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

    if (usuarioLogado !== 'true' || !horaLogin) {
        // Se não estiver logado ou não houver hora de login, redireciona para a página de login
        window.location.href = "./home/index.html";
    } else {
        var agora = Date.now();

        // Verifica se o tempo desde o login ultrapassou o tempo máximo permitido
        if (agora - horaLogin > tempoMaximo) {
            alert('Sessão expirada, faça login novamente.');

            // Remove o estado de login e redireciona para a página de login
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('horaLogin');
            window.location.href = "./home/index.html";
        }
    }
};
function logout() {
    // Remove o estado de login e a hora do login do localStorage
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('horaLogin');

    // Redireciona para a página de login
    window.location.href = "./home/index.html";  // ajuste o caminho conforme necessário
}

const body = document.querySelector("body"),
      sidebar = body.querySelector(".sideMenu"),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".sideMenuSearch"),
      modeSwtich = body.querySelector(".sideMenuToggle"),
      modeText = body.querySelector(".sideMenuModeText");

toggle.addEventListener("click", () =>{
    sidebar.classList.toggle("close");
});

modeSwtich.addEventListener("click", () =>{
    body.classList.toggle("dark");

    if(body.classList.contains("dark")){
        modeText.innerText = "Light Mode"
    } else {
        modeText.innerText = "Dark Mode"
    }
});

// Funcionamento Forms
document.addEventListener('DOMContentLoaded', function () {
    const serialInput = document.getElementById('serial');
    const modeloDiv = document.getElementById('modeloDiv');
    const idSerialDiv = document.getElementById('idSerialDiv');
    const observacaoDiv = document.getElementById('observacaoDiv');
    const tipoDispositivoDiv = document.getElementById('tipoDispositivoDiv');
    const submitButton = document.getElementById('submitButton');

    // Inicialmente esconde os campos de observação, tipo de dispositivo e o botão
    modeloDiv.style.display = 'none';
    idSerialDiv.style.display = 'none';
    observacaoDiv.style.display = 'none';
    tipoDispositivoDiv.style.display = 'none';
    submitButton.style.display = 'none';

    function isPeriferico(inputValue) {
        const perifericos = ['monitor', 'teclado', 'mouse', 'adaptador', 'displayport'];
        return perifericos.some(periferico => inputValue.toLowerCase().includes(periferico));
    }

    function updateFields(inputValue) {
        if (inputValue.toLowerCase().startsWith('excluir')) {
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Excluir';
        } else if (isPeriferico(inputValue)) {
            // Mostrar campos específicos para periféricos
            document.getElementById('modeloDiv').style.display = 'flex';
            document.getElementById('idSerialDiv').style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex';  // Exibir o tipo de dispositivo (periférico)
            observacaoDiv.style.display = 'flex';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar Periférico';
        } else if (inputValue !== '') {
            // Para desktops e notebooks
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex';  // Exibir tipo de dispositivo
            document.getElementById('modeloDiv').style.display = 'none';
            document.getElementById('idSerialDiv').style.display = 'none';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar';
        } else {
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
            document.getElementById('modeloDiv').style.display = 'none';  
            document.getElementById('idSerialDiv').style.display = 'none'; 
            submitButton.style.display = 'none';
        }
    }

    serialInput.addEventListener('input', function () {
        updateFields(serialInput.value.trim());
    });

    serialInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitButton.click();
        }
    });

    submitButton.addEventListener('click', function (event) {
        event.preventDefault();
        const inputValue = serialInput.value.trim();

        if (submitButton.textContent === 'Excluir') {
            const serial = inputValue.split(' ')[1];
            excluirSerial(serial);
        } else if (isPeriferico(inputValue)) {
            // Adicionar periférico
            const modelo = document.getElementById('modelo').value.trim();
            const idSerial = document.getElementById('idSerial').value.trim();
            const tipoDispositivo = document.getElementById('tipoDispositivo').value; // Obter o tipo do select
            const observacao = document.getElementById('observacao').value.trim();
            
            adicionarPeriferico(modelo, idSerial, tipoDispositivo, observacao);
        } else {
            // Adicionar dispositivo (desktop/notebook)
            const serial = serialInput.value.trim();
            const observacao = document.getElementById('observacao').value.trim();
            const tipoDispositivo = document.getElementById('tipoDispositivo').value;

            adicionarSerial(serial, observacao, tipoDispositivo);
        }
    });

    function adicionarSerial(serial, observacao, tipoDispositivo) {
        fetch('/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serial: serial,
                observacao: observacao,
                tipoDispositivo: tipoDispositivo
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                exibirMensagem('Erro: ' + data.erro, 'erro');
            } else if (data.mensagem) {
                console.log('Adicionado com sucesso:', data);
                exibirMensagem(data.mensagem, 'sucesso');
            } else {
                exibirMensagem('Resposta inesperada do servidor.', 'erro');
            }
        })
        .catch((error) => {
            console.error('Erro ao adicionar:', error);
            exibirMensagem('Erro ao adicionar equipamento.', 'erro');
        });
    }

    function adicionarPeriferico(modelo, idSerial, tipoDispositivo, observacao) {
        fetch('/adicionar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                modelo: modelo,
                serial: idSerial,
                tipoDispositivo: tipoDispositivo,
                observacao: observacao
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                exibirMensagem('Erro: ' + data.erro, 'erro');
            } else if (data.mensagem) {
                exibirMensagem(data.mensagem, 'sucesso');
            } else {
                exibirMensagem('Resposta inesperada do servidor.', 'erro');
            }
        })
        .catch((error) => {
            console.error('Erro ao adicionar periférico:', error);
            exibirMensagem('Erro ao adicionar periférico.', 'erro');
        });
    }

    function excluirSerial(serial) {
        const mensagem = `Excluir ${serial}`;
        console.log(`Enviando requisição de exclusão para serial: ${serial}`);  // Log para verificar qual serial está sendo enviado
        fetch('/excluir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensagem: mensagem }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resposta do backend:', data);  // Log para verificar a resposta do backend
            if (data.status === 'success') {
                exibirMensagem(data.message, 'sucesso');
                if (data.aviso) {
                    console.log('Aviso recebido:', data.aviso);  // Log para verificar se o aviso está sendo recebido
                    exibirAvisoCotacao(data.aviso, serial);  // Exibe o aviso se houver menos de 5 itens
                }
            } else {
                exibirMensagem('Erro: ' + data.message, 'erro');
            }
        })
        .catch((error) => {
            console.error('Erro ao excluir:', error);
            exibirMensagem('Erro ao excluir equipamento.', 'erro');
        });
    }    

    function exibirAvisoCotacao(mensagem, equipamento) {
        const avisoElemento = document.getElementById('avisoCotacao');
        const avisoMensagem = document.getElementById('avisoMensagem');
        const adicionarBtn = document.getElementById('adicionarCotacaoBtn');
        const cancelarBtn = document.getElementById('cancelarCotacaoBtn');
    
        // Define a mensagem e exibe a section
        avisoMensagem.textContent = mensagem;
        avisoElemento.style.display = 'block';
    
        // Botão de adicionar à cotação
        adicionarBtn.onclick = function() {
            adicionarCotacao(equipamento);
            avisoElemento.style.display = 'none';  // Oculta a section após a ação
        };
    
        // Botão de cancelar
        cancelarBtn.onclick = function() {
            avisoElemento.style.display = 'none';  // Oculta a section
        };
    }
    
    
    function adicionarCotacao(equipamento, quantidade = 1) {
        const data = {
            equipamento: equipamento,
            quantidade: quantidade,
            link: '',  // Pode ser deixado em branco ou preenchido mais tarde
            data: new Date().toISOString().split('T')[0],  // Data atual no formato 'YYYY-MM-DD'
            tipo: 'Cotação Automática'  // Define um tipo padrão para a cotação
        };

        fetch('/submit', {  // Usando a rota existente para adicionar à cotação
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            exibirMensagem(data.message, 'sucesso');

            // Recarregar a tabela de cotações e atualizar a contagem de tipos
            carregarCotacoes();
            atualizarContagemTipos();
        })
        .catch(error => {
            console.error('Erro ao adicionar cotação:', error);
            exibirMensagem('Erro ao adicionar cotação.', 'erro');
        });
    }
});

// Função para exibir mensagens na tela
function exibirMensagem(mensagem, tipo) {
    const mensagemElemento = document.getElementById('mensagem');
    mensagemElemento.textContent = mensagem;
    mensagemElemento.className = tipo; // Adiciona a classe para estilo (sucesso ou erro)

    // Remove a mensagem após 5 segundos (5000 milissegundos)
    setTimeout(() => {
        mensagemElemento.textContent = '';
        mensagemElemento.className = ''; // Remove a classe para limpar o estilo
    }, 5000);
}