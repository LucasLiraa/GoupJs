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
    const observacaoDiv = document.getElementById('observacaoDiv');
    const tipoDispositivoDiv = document.getElementById('tipoDispositivoDiv');
    const submitButton = document.getElementById('submitButton');

    // Inicialmente esconde os campos de observação, tipo de dispositivo e o botão
    observacaoDiv.style.display = 'none';
    tipoDispositivoDiv.style.display = 'none';
    submitButton.style.display = 'none';

    function updateFields(inputValue) {
        if (inputValue.toLowerCase().startsWith('excluir')) {
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Excluir';
        } else if (inputValue !== '') {
            observacaoDiv.style.display = 'flex';
            tipoDispositivoDiv.style.display = 'flex';
            submitButton.style.display = 'block';
            submitButton.textContent = 'Adicionar';
        } else {
            observacaoDiv.style.display = 'none';
            tipoDispositivoDiv.style.display = 'none';
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
        } else {
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
                console.log('Erro ao adicionar:', data);
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
