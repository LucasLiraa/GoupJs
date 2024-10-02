window.onload = function() {
    var usuarioLogado = localStorage.getItem('usuarioLogado');
    var horaLogin = localStorage.getItem('horaLogin');
    var nomeUsuario = localStorage.getItem('nomeUsuario');
    var tempoMaximo = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

    if (usuarioLogado !== 'true' || !horaLogin) {
        // Se não estiver logado ou não houver hora de login, redireciona para a página de login
        window.location.href = "../home/index.html";
    } else {
        var agora = Date.now();

        // Verifica se o tempo desde o login ultrapassou o tempo máximo permitido
        if (agora - horaLogin > tempoMaximo) {
            alert('Sessão expirada, faça login novamente.');

            // Remove o estado de login e redireciona para a página de login
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('horaLogin');
            localStorage.removeItem('nomeUsuario');
            window.location.href = "../home/index.html";
        } else {
            // Exibe o nome do usuário na página, se estiver logado
            if (nomeUsuario) {
                document.getElementById('nomeUsuario').innerText = nomeUsuario;
            }
        }
    }

    // Carrega as cotações
    carregarDescartes();
};
function logout() {
    // Remove o estado de login e a hora do login do localStorage
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('horaLogin');

    // Redireciona para a página de login
    window.location.href = "./home/index.html";  // ajuste o caminho conforme necessário
}

document.addEventListener("DOMContentLoaded", function() {
  const body = document.querySelector("body"),
        sidebar = body.querySelector(".sideMenu"),
        toggle = body.querySelector(".toggle"),
        modeSwitch = body.querySelector(".sideMenuToggle"),
        modeText = body.querySelector(".sideMenuModeText");

  toggle.addEventListener("click", () => {
      sidebar.classList.toggle("close");
  });

  modeSwitch.addEventListener("click", () => {
      body.classList.toggle("dark");

      if (body.classList.contains("dark")) {
          modeText.innerText = "Light Mode";
      } else {
          modeText.innerText = "Dark Mode";
      }

      updateChartColors();
  })
});


function atualizarContagemTiposDescarte() {
    fetch('/contar_tipos_descarte')
        .then(response => response.json())
        .then(data => {
            // Seleciona todos os elementos que têm o texto específico nos <p> e atualiza o <h1> correspondente
            const itensBox = document.querySelectorAll('.descarteItensBox');
  
            itensBox.forEach(box => {
                const titulo = box.querySelector('.descarteItensBoxContent p').textContent;
  
                if (titulo.includes('Máquinas')) {
                    box.querySelector('.descarteItensBoxContent h1').textContent = data.maquinas;
                } else if (titulo.includes('Periféricos')) {
                    box.querySelector('.descarteItensBoxContent h1').textContent = data.perifericos;
                } else if (titulo.includes('Cabos')) {
                    box.querySelector('.descarteItensBoxContent h1').textContent = data.cabos;
                } else if (titulo.includes('Peças')) {
                    box.querySelector('.descarteItensBoxContent h1').textContent = data.pecas;
                } else if (titulo.includes('Outros')) {
                    box.querySelector('.descarteItensBoxContent h1').textContent = data.outros;
                }
            });
        })
        .catch(error => {
            console.error('Erro ao buscar contagem de tipos:', error);
        });
}
  
  // Função para obter os dados de descarte e preencher a tabela
  function carregarDescartes() {
    fetch('/obter_descartes')
    .then(response => response.json())
    .then(data => {
        const tabela = document.querySelector('.discard-table tbody');
        tabela.innerHTML = ''; // Limpa a tabela antes de preencher
  
        data.forEach(descarte => {
            const linha = document.createElement('tr');
            
            // Formata a data de 'YYYY-MM-DD' para 'DD-MM-YYYY'
            const dataDescarte = new Date(descarte.Data);
            const dataFormatada = dataDescarte.toLocaleDateString('pt-BR');
  
            // Cria colunas da tabela com os dados do descarte
            linha.innerHTML = `
                <td>${descarte.Equipamento}</td>
                <td>${descarte.Serial}</td>
                <td>${descarte.Tipo}</td>
                <td>${dataFormatada}</td>
                <td>${descarte.Motivo}</td>
                <td>${descarte.Contato}</td>
                <td><button class="btnExcluir" data-id="${descarte.Equipamento}">Excluir</button></td>
            `;
  
            tabela.appendChild(linha); // Adiciona a linha na tabela
        });
  
        // Adiciona o evento de clique aos botões de exclusão
        adicionarEventosExclusaoDescarte();
    })
    .catch(error => {
        console.error('Erro ao carregar descartes:', error);
    });
  }
  
  // Função para adicionar eventos de exclusão
  function adicionarEventosExclusaoDescarte() {
    const botoesExcluir = document.querySelectorAll('.btnExcluir');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function() {
            const equipamento = this.getAttribute('data-id');
            excluirDescarte(equipamento);
        });
    });
  }
  
  function excluirDescarte(equipamento) {
    fetch('/excluir_descarte', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ equipamento: equipamento }),
    })
    .then(response => response.json())
    .then(data => {
        exibirMensagem(data.message, 'sucesso');
  
        // Recarregar a tabela de descartes e atualizar a contagem de tipos
        carregarDescartes();
        atualizarContagemTiposDescarte(); // Atualiza a contagem de cada tipo
    })
    .catch(error => {
        console.error('Erro ao excluir descarte:', error);
        exibirMensagem('Erro ao excluir item.', 'erro');
    });
  }

  // Abrir o formulário quando clicar no botão "Administrar Descartes"
  document.querySelector('.discardControlButton button').addEventListener('click', function() {
    document.querySelector('.sectionDiscardForms').style.display = 'flex';
  });
  // Fechar o formulário quando clicar no botão de fechar
  document.querySelector('.closeFormButton').addEventListener('click', function() {
    document.querySelector('.sectionDiscardForms').style.display = 'none';
  });
  
  document.getElementById('formDescarte').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const data = {
        equipamento: document.getElementById('equipamento').value,
        serial: document.getElementById('serial').value,
        tipo: document.getElementById('tipo').value,
        data: document.getElementById('data').value,
        motivo: document.getElementById('motivo').value,
        contato: document.getElementById('contato').value
    };
  
    fetch('/submit_descarte', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        exibirMensagem(data.message, 'sucesso');
  
        // Recarregar a tabela de descartes e atualizar a contagem de tipos
        carregarDescartes();
        atualizarContagemTiposDescarte(); // Atualiza a contagem de cada tipo
  
        document.getElementById('formDescarte').reset();
    })
    .catch(error => {
        console.error('Erro:', error);
        exibirMensagem('Erro ao adicionar item.', 'erro');
    });
  });

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

  
document.getElementById('exportarPlanilhaDiscard').addEventListener('click', function() {
    window.location.href = '/exportar_planilha_descarte';
});  