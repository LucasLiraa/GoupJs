window.onload = function() {
    // Verifica se o usuário está logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const horaLogin = parseInt(localStorage.getItem('horaLogin'), 10); // Converte a hora para número
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const tempoMaximo = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

    const redirecionarParaLogin = () => {
        // Remove o estado de login e redireciona para a página de login
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('horaLogin');
        localStorage.removeItem('nomeUsuario');
        window.location.href = "./home/index.html";
    };

    if (usuarioLogado !== 'true' || isNaN(horaLogin)) {
        redirecionarParaLogin();
    } else {
        const agora = Date.now();

        // Verifica se o tempo desde o login ultrapassou o tempo máximo permitido
        if (agora - horaLogin > tempoMaximo) {
            alert('Sessão expirada, faça login novamente.');
            redirecionarParaLogin();
        } else {
            // Exibe o nome do usuário na página, se estiver logado
            if (nomeUsuario) {
                document.getElementById('nomeUsuario').innerText = nomeUsuario;
            }
        }
    }

    // Verifica a preferência de modo no LocalStorage
    const modoSalvo = localStorage.getItem('modoEscuro'); // Obtém a preferência do LocalStorage
    const body = document.querySelector("body");
    const modeText = document.querySelector(".sideMenuModeText");

    if (modoSalvo === 'escuro') {
        body.classList.add('dark');
        modeText.innerText = "Light Mode"; // Atualiza o texto
    } else {
        body.classList.remove('dark');
        modeText.innerText = "Dark Mode";
    }
    carregarUltimaAtualizacao();
};

// Alterna o modo e salva a preferência no LocalStorage
const body = document.querySelector("body"),
      sidebar = body.querySelector(".sideMenu"),
      toggle = body.querySelector(".toggle"),
      modeSwitch = body.querySelector(".sideMenuToggle"),
      modeText = body.querySelector(".sideMenuModeText");

modeSwitch.addEventListener("click", () => {
    body.classList.toggle("dark");

    if (body.classList.contains("dark")) {
        modeText.innerText = "Light Mode";
        localStorage.setItem('modoEscuro', 'escuro');  // Salva a preferência
    } else {
        modeText.innerText = "Dark Mode";
        localStorage.setItem('modoEscuro', 'claro');   // Salva a preferência
    }
});

// Controla a exibição da sidebar
toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
});

// Função de logout
function logout() {
    // Remove o estado de login e a hora do login do LocalStorage
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('horaLogin');
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('modoEscuro'); // Opcional: remover o modo ao deslogar

    // Redireciona para a página de login
    window.location.href = "./home/index.html";  // ajuste o caminho conforme necessário
}

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
    
        // Verificar se os elementos existem
        if (!avisoElemento || !avisoMensagem || !adicionarBtn || !cancelarBtn) {
            console.error("Elemento necessário não encontrado no DOM.");
            return;
        }
    
        // Exibe a mensagem e a section de aviso
        avisoMensagem.textContent = mensagem;
        avisoElemento.style.display = 'block';
    
        // Botão de adicionar à cotação
        adicionarBtn.onclick = function() {
            adicionarCotacao(equipamento);
            avisoElemento.style.display = 'none';  // Oculta a section após adicionar à cotação
        };
    
        // Botão de cancelar
        cancelarBtn.onclick = function(event) {
            event.preventDefault();  // Impede a submissão do formulário
            avisoElemento.style.display = 'none';  // Oculta a section de aviso
        };
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

document.querySelector('.closeFormButton').addEventListener('click', function() {
    document.querySelector('.sectionAlertForms').style.display = 'none';
});

document.querySelector('.closeResultButton').addEventListener('click', function() {
    document.querySelector('.sectionSearchResult').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    // Função para buscar o serial
    function buscarSerial() {
        const serial = document.getElementById('serialInput').value;

        if (!serial) {
            alert('Por favor, insira um serial.');
            return;
        }

        fetch('/buscar_serial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serial: serial })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Verifique o conteúdo da resposta aqui
            const resultadoDiv = document.getElementById('resultadoBusca');
            const infoDiv = document.getElementById('informacoesDispositivo');
        
            // Limpar qualquer resultado anterior
            infoDiv.innerHTML = '';
        
            if (data.status === 'success') {
                const dispositivo = data.dispositivo;
                
                // Preencher as informações do dispositivo
                infoDiv.innerHTML += `<p><strong>Modelo:</strong> ${dispositivo.ModeloDispositivo}</p>`;
                infoDiv.innerHTML += `<p><strong>Serial:</strong> ${dispositivo.SerialDispositivo}</p><br>`;
                infoDiv.innerHTML += `<p><strong>Processador:</strong> ${dispositivo.ProcessadorUsado}</p>`;
                infoDiv.innerHTML += `<p><strong>Memória:</strong> ${dispositivo.MemoriaTotal}</p>`;
                infoDiv.innerHTML += `<p><strong>Armazenamento:</strong> ${dispositivo.ArmazenamentoInterno}</p><br>`;
                infoDiv.innerHTML += `<p><strong>Observação:</strong> ${dispositivo.ObservacaoDispositivo}</p>`;
        
                // Mostrar a section de resultado
                resultadoDiv.style.display = 'block';
            } else {
                // Exibir mensagem de erro
                infoDiv.innerHTML = `<p>${data.message}</p>`;
                resultadoDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao buscar o serial.');
        });
    }

    // Vincula a função buscar ao botão de busca
    const searchButton = document.getElementById('buscarButton');  // Corrigido para usar ID
    if (searchButton) {
        searchButton.addEventListener('click', function(event) {
            event.preventDefault(); // Impede o comportamento padrão do botão
            buscarSerial();
        });
    }
});


// Função para registrar a última atualização no servidor
function registrarUltimaAtualizacao() {
    const nomeUsuario = localStorage.getItem('nomeUsuario'); // Nome do usuário logado

    // Enviar os dados para o servidor
    fetch('/registrar_atualizacao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nomeUsuario: nomeUsuario
        })
    })
    .then(response => response.json())
    .then(data => {
        // Atualizar a exibição com os dados retornados
        document.getElementById('ultimaAtualizacao').innerText = data.ultimaAtualizacao.data;
        document.getElementById('usuarioResponsavel').innerText = data.ultimaAtualizacao.usuario;
    })
    .catch((error) => {
        console.error('Erro ao registrar a atualização:', error);
    });
}

// Função para carregar os dados da última atualização na página
function carregarUltimaAtualizacao() {
    // Requisição ao servidor para obter a última atualização
    fetch('/obter_atualizacao')
    .then(response => response.json())
    .then(data => {
        if (data.data && data.usuario) {
            document.getElementById('ultimaAtualizacao').innerText = data.data;
            document.getElementById('usuarioResponsavel').innerText = data.usuario;
        } else {
            document.getElementById('ultimaAtualizacao').innerText = 'Nenhuma atualização registrada';
            document.getElementById('usuarioResponsavel').innerText = 'Desconhecido';
        }
    })
    .catch((error) => {
        console.error('Erro ao carregar a última atualização:', error);
    });
}

// Exemplo de como chamar a função registrarUltimaAtualizacao após uma ação (como adicionar ou excluir item)
document.getElementById('submitButton').addEventListener('click', function(event) {
    event.preventDefault();
    // Chame aqui a função de adicionar item e depois registre a atualização
    // adicionarSerial(serial, observacao, tipoDispositivo);  // Exemplo de chamada de função já existente
    registrarUltimaAtualizacao();  // Registra a atualização
});