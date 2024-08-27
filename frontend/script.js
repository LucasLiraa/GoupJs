const body = document.querySelector("body"),
      sidebar = body.querySelector(".sideMenu"),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".sideMenuSearch"),
      modeSwtich = body.querySelector(".sideMenuToggle"),
      modeText = body.querySelector(".sideMenuModeText");

      toggle.addEventListener("click", () =>{
        sidebar.classList.toggle("close");
      })

      modeSwtich.addEventListener("click", () =>{
        body.classList.toggle("dark");

        if(body.classList.contains("dark")){
            modeText.innerText = "Light Mode"
        }else{
            modeText.innerText = "Dark Mode"
        }
      })


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
        // Aqui você pode enviar uma requisição para o backend
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
            console.log('Adicionado com sucesso:', data);
        })
        .catch((error) => {
            console.error('Erro ao adicionar:', error);
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
            console.log('Excluído com sucesso:', data);
        })
        .catch((error) => {
            console.error('Erro ao excluir:', error);
        });
    }
    
});


// Função para adicionar item
function adicionarItem(serial, observacao, tipoDispositivo) {
    const data = {
        serial: serial,
        observacao: observacao,
        tipoDispositivo: tipoDispositivo
    };

    fetch('/adicionar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            exibirMensagem(data.message, 'success');
        } else {
            exibirMensagem(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        exibirMensagem('Ocorreu um erro ao adicionar o item.', 'error');
    });
}

// Função para excluir item
function excluirItem(serial) {
    const data = {
        mensagem: `Excluir ${serial}`
    };

    fetch('/excluir', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            exibirMensagem(data.message, 'success');
        } else {
            exibirMensagem(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        exibirMensagem('Ocorreu um erro ao excluir o item.', 'error');
    });
}

function exibirMensagem(mensagem, tipo) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.textContent = mensagem;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.style.display = 'block';

    // Esconde a mensagem após alguns segundos
    setTimeout(() => {
        mensagemDiv.style.display = 'none';
    }, 5000);
}