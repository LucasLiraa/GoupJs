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
        const perifericos = ['monitor', 'teclado', 'mouse'];
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
            document.getElementById('modeloDiv').style.display = 'flex';  // Exibir campo de modelo
            document.getElementById('idSerialDiv').style.display = 'flex'; // Exibir campo de ID/Serial
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'none'; // Esconder tipo de dispositivo
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar Periférico';
        } else if (inputValue !== '') {
            // Para desktops e notebooks
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex'; // Exibir tipo de dispositivo para notebooks e desktops
            document.getElementById('modeloDiv').style.display = 'none';  // Esconder campo de modelo
            document.getElementById('idSerialDiv').style.display = 'none'; // Esconder campo de ID/Serial
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
            const observacao = document.getElementById('observacao').value.trim();
            
            adicionarPeriferico(modelo, idSerial, inputValue, observacao);
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
            if (data.erro) { // Verifica se a resposta contém um erro
                exibirMensagem('Erro: ' + data.erro, 'erro');
            } else if (data.mensagem) { // Verifica se há uma mensagem de sucesso
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
                limparFormulario();  // Limpa o formulário após o sucesso
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
        fetch('/excluir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensagem: mensagem }),
        })
        .then(response => response.json())
        .then(data => {
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