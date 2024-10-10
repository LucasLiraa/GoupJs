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

function atualizarContagemTipos() {
  fetch('/contar_tipos')
      .then(response => response.json())
      .then(data => {
          // Seleciona todos os elementos que têm o texto específico nos <p> e atualiza o <h1> correspondente
          const itensBox = document.querySelectorAll('.reposItensBox');

          itensBox.forEach(box => {
              const titulo = box.querySelector('.reposItensBoxContent p').textContent;

              if (titulo.includes('Máquinas')) {
                  box.querySelector('.reposItensBoxContent h1').textContent = data.maquinas;
              } else if (titulo.includes('Periféricos')) {
                  box.querySelector('.reposItensBoxContent h1').textContent = data.perifericos;
              } else if (titulo.includes('Cabos')) {
                  box.querySelector('.reposItensBoxContent h1').textContent = data.cabos;
              } else if (titulo.includes('Peças')) {
                  box.querySelector('.reposItensBoxContent h1').textContent = data.pecas;
              } else if (titulo.includes('Outros')) {
                  box.querySelector('.reposItensBoxContent h1').textContent = data.outros;
              }
          });
      })
      .catch(error => {
          console.error('Erro ao buscar contagem de tipos:', error);
      });
}
// Chamar a função assim que a página carregar
document.addEventListener('DOMContentLoaded', atualizarContagemTipos);

// Função para obter os dados das cotações e preencher a tabela
function carregarCotacoes() {
  fetch('/obter_cotacoes')
  .then(response => response.json())
  .then(data => {
      const tabela = document.querySelector('.reposTable tbody');
      tabela.innerHTML = ''; // Limpa a tabela antes de preencher

      data.forEach(cotacao => {
          const linha = document.createElement('tr');
          
          // Formata a data de 'YYYY-MM-DD' para 'DD-MM-YYYY'
          const dataCotacao = new Date(cotacao.Data);
          const dataFormatada = dataCotacao.toLocaleDateString('pt-BR');

          // Cria colunas da tabela com os dados da cotação
          linha.innerHTML = `
              <td>${cotacao.Equipamento}</td>
              <td>${cotacao.Quantidade}</td>
              <td><a href="${cotacao.Link}" target="_blank">Link</a></td>
              <td>${dataFormatada}</td>
              <td>${cotacao.Tipo}</td>
              <td><button class="btnExcluir" data-id="${cotacao.Equipamento}">Excluir</button></td>
          `;

          tabela.appendChild(linha); // Adiciona a linha na tabela
      });

      // Adiciona o evento de clique aos botões de exclusão
      adicionarEventosExclusao();
  })
  .catch(error => {
      console.error('Erro ao carregar cotações:', error);
  });
}
// Função para adicionar eventos de exclusão
function adicionarEventosExclusao() {
  const botoesExcluir = document.querySelectorAll('.btnExcluir');
  botoesExcluir.forEach(botao => {
      botao.addEventListener('click', function() {
          const equipamento = this.getAttribute('data-id');
          excluirCotacao(equipamento);
      });
  });
}
function excluirCotacao(equipamento) {
  fetch('/excluir_cotacao', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ equipamento: equipamento }),
  })
  .then(response => response.json())
  .then(data => {
      exibirMensagem(data.message, 'sucesso');

      // Recarregar a tabela de cotações e atualizar a contagem de tipos
      carregarCotacoes();
      atualizarContagemTipos(); // Atualiza a contagem de cada tipo
  })
  .catch(error => {
      console.error('Erro ao excluir cotação:', error);
      exibirMensagem('Erro ao excluir item.', 'erro');
  });
}

// Abrir o formulário quando clicar no botão "Administrar Cotações"
document.querySelector('.reposControlButton button').addEventListener('click', function() {
  document.querySelector('.sectionReposForms').style.display = 'flex';
});
// Fechar o formulário quando clicar no botão de fechar
document.querySelector('.closeFormButton').addEventListener('click', function() {
  document.querySelector('.sectionReposForms').style.display = 'none';
});

document.getElementById('formCotacao').addEventListener('submit', function(event) {
  event.preventDefault();

  const data = {
      equipamento: document.getElementById('equipamento').value,
      quantidade: document.getElementById('quantidade').value,
      link: document.getElementById('link').value,
      data: document.getElementById('data').value,
      tipo: document.getElementById('tipo').value
  };

  fetch('/submit', {
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
      atualizarContagemTipos(); // Atualiza a contagem de cada tipo

      document.getElementById('formCotacao').reset();
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

document.getElementById('exportarPlanilha').addEventListener('click', function() {
  window.location.href = '/exportar_planilha';
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
                infoDiv.innerHTML = `<p>${data.message}</p>`;
                resultadoDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao buscar o serial.');
        });
    }

    // Função para fechar a section de resultado
    function fecharResultado() {
        document.getElementById('resultadoBusca').style.display = 'none';
    }

    // Vincula a função fechar ao botão de fechar
    document.querySelector('.closeResultButton').addEventListener('click', function(event) {
        event.preventDefault(); // Impede o comportamento padrão do botão
        fecharResultado();
    });

    // Vincula a função buscar ao botão de busca
    document.querySelector('.sideMenuSearch button').addEventListener('click', buscarSerial);
});