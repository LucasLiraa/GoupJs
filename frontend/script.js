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

//Funcionamento Pesquisa
document.addEventListener('DOMContentLoaded', function () {
    const serialInput = document.getElementById('serial');
    const observacaoDiv = document.getElementById('observacaoDiv');
    const tipoDispositivoDiv = document.getElementById('tipoDispositivoDiv');
    const modeloDiv = document.getElementById('modeloDiv');  // Novo campo
    const idDiv = document.getElementById('idDiv');          // Novo campo
    const submitButton = document.getElementById('submitButton');

    // Inicialmente esconde os campos
    observacaoDiv.style.display = 'none';
    tipoDispositivoDiv.style.display = 'none';
    modeloDiv.style.display = 'none';
    idDiv.style.display = 'none';
    submitButton.style.display = 'none';

    function updateFields(inputValue) {
        const palavrasChave = ["Monitor", "Teclado", "Mouse", "Adaptador", "DisplayPort"];
        const isManual = palavrasChave.some(palavra => inputValue.includes(palavra));

        if (inputValue.toLowerCase().startsWith('excluir')) {
            // Caso seja uma exclusão, esconde os outros campos e mostra apenas o campo de serial e botão de excluir
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
            modeloDiv.style.display = 'none';
            idDiv.style.display = 'none';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Excluir';
        } else if (isManual) {
            // Mostrar os campos adicionais para adição manual
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex';
            modeloDiv.style.display = 'flex';
            idDiv.style.display = 'flex';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar Manualmente';
        } else if (inputValue !== '') {
            // Mostrar apenas os campos de observação e tipo ao consultar
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex';
            modeloDiv.style.display = 'none';
            idDiv.style.display = 'none';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar';
        } else {
            // Esconder todos os campos se não houver entrada
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
            modeloDiv.style.display = 'none';
            idDiv.style.display = 'none';
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
        const modelo = document.getElementById('modelo').value.trim();  // Captura o valor do modelo
        const id = document.getElementById('id').value.trim();          // Captura o valor do ID (serial manual)
        const observacao = document.getElementById('observacao').value.trim();
        const tipoDispositivo = document.getElementById('tipoDispositivo').value;

        if (submitButton.textContent === 'Excluir') {
            const serial = inputValue.split(' ')[1]; // Extraindo o serial após a palavra "excluir"
            excluirSerial(serial);
        } else if (submitButton.textContent === 'Adicionar Manualmente') {
            adicionarSerialManual(modelo, id, observacao, tipoDispositivo);
        } else {
            adicionarSerial(inputValue, observacao, tipoDispositivo);
        }
    });

    function excluirSerial(serial) {
        const mensagem = `Excluir ${serial}`;  // Formata a mensagem como o backend espera
        fetch('/excluir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensagem: mensagem }),  // Envia a mensagem formatada
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resposta do backend:', data); // Log detalhado da resposta
        
            if (data.status === 'success') {
                exibirMensagem(data.message, 'sucesso');
            } else {
                exibirMensagem('Erro: ' + data.message, 'erro');
            }
        })
        .catch((error) => {
            console.error('Erro ao excluir:', error);
            exibirMensagem('Erro ao excluir equipamento.', 'erro');
        });
    }

    function adicionarSerialManual(serial, modelo, observacao, tipoDispositivo) {
        // Verifica se é uma palavra-chave (sem consulta) ou serial válido (com consulta)
        const palavrasChave = ["Monitor", "Teclado", "Mouse", "Adaptador", "DisplayPort"];
    
        // Se o serial é uma palavra-chave, abre os campos adicionais sem consultar o backend
        if (palavrasChave.includes(serial)) {
            abrirCamposManuais();
        } else {
            // Faz a consulta ao backend para adicionar com base no serial
            fetch('/adicionar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serial: serial,
                    modelo: modelo || '', // Modelo preenchido manualmente
                    observacao: observacao || '',
                    tipoDispositivo: tipoDispositivo || ''
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    exibirMensagem('Erro ao adicionar: ' + data.erro, 'erro');
                } else {
                    exibirMensagem('Equipamento adicionado com sucesso!', 'sucesso');
                    atualizarTabelaEstoque(data); // Atualiza a tabela
                }
            })
            .catch((error) => {
                console.error('Erro ao adicionar:', error);
                exibirMensagem('Erro ao adicionar equipamento.', 'erro');
            });
        }
    }
    
    function abrirCamposManuais() {
        // Função para abrir os campos para preenchimento manual
        document.getElementById('modeloDiv').style.display = 'block';
        document.getElementById('observacaoDiv').style.display = 'block';
        document.getElementById('tipoDispositivoDiv').style.display = 'block';
    }
    
    function atualizarTabelaEstoque(dados) {
        // Verificação e substituição de valores NaN por strings vazias
        dados.forEach(item => {
            // Verifica cada chave do item
            for (let chave in item) {
                if (isNaN(item[chave]) || item[chave] === 'NaN' || item[chave] === null || item[chave] === undefined) {
                    // Substitui NaN, null ou undefined por uma string vazia
                    item[chave] = '';
                }
            }
        });
    
        // Agora você pode continuar com o processamento e exibição dos dados
        let tabela = document.getElementById('tabelaEstoque'); // Exemplo de tabela de estoque
        tabela.innerHTML = '';  // Limpa a tabela antes de inserir novos dados
    
        // Cria e insere cada linha de dados na tabela
        dados.forEach(item => {
            let linha = document.createElement('tr');
    
            for (let chave in item) {
                let celula = document.createElement('td');
                celula.innerHTML = item[chave];  // Preenche a célula com os valores ajustados
                linha.appendChild(celula);
            }
    
            tabela.appendChild(linha);  // Adiciona a linha à tabela
        });
    }
    
    // Função de adicionarSerial continua a mesma para serial padrão
    function adicionarSerial(serial, observacao, tipoDispositivo) {
        fetch(`/verificar_serial?serial=${serial}`)
            .then(response => response.json())
            .then(data => {
                if (data.existe) {
                    exibirMensagem('Erro: Este serial já está presente no estoque.', 'erro');
                } else {
                    fetch('/adicionar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            serial: serial,
                            observacao: observacao || "",  // Observação vazia se não informada
                            tipoDispositivo: tipoDispositivo || ""  // Tipo vazio se não informado
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
                        console.error('Erro ao adicionar:', error);
                        exibirMensagem('Erro ao adicionar equipamento.', 'erro');
                    });
                }
            })
            .catch((error) => {
                console.error('Erro ao verificar serial:', error);
                exibirMensagem('Erro ao verificar serial.', 'erro');
            });
    }

    // Função para exibir mensagens na tela
    function exibirMensagem(mensagem, tipo) {
        const mensagemElemento = document.getElementById('mensagem');
        mensagemElemento.textContent = mensagem;
        mensagemElemento.className = tipo;

        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            mensagemElemento.textContent = '';
            mensagemElemento.className = '';
        }, 5000);
    }
});