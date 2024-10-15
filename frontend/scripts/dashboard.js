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

// Funcionamento Pesquisa
document.getElementById('serialInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        buscarSerial();
    }
});

function buscarSerial() {
    const serial = document.getElementById('serialInput').value;
    fetch(`https://goupjsapi.onrender.com/buscar_serial?serial=${serial}`)
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert(`Serial: ${data.SerialDispositivo}\nNome: ${data.NomeDispositivo}\nModelo: ${data.ModeloDispositivo}
                \nProcessador: ${data.ProcessadorUsado}\nMemória: ${data.MemoriaTotal}\nArmazenamento: ${data.ArmazenamentoInterno}
                \nObservação: ${data.ObservacaoDispositivo}`);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
}

// Contagem e Atualização de Desktops e Notebooks
async function contarLinhasDesktops() {
    try {
        const response = await fetch('/contar_linhas_desktops');
        const data = await response.json();

        if (data.linhas_desktops !== undefined) {
            const totalDesktopsElement = document.getElementById('linhasDesktops');
            if (totalDesktopsElement) {
                totalDesktopsElement.textContent = data.linhas_desktops;
                atualizarResultadoDesktops();
            } else {
                console.error("Elemento 'linhasDesktops' não encontrado.");
            }
        } else {
            console.error('Erro ao contar as linhas de desktops:', data.error);
        }
    } catch (error) {
        console.error('Erro ao contar as linhas de desktops:', error);
    }
}
async function contarLinhasComObservacaoDesktop() {
    try {
        const response = await fetch('/contar_linhas_com_observacao_desktop');
        const data = await response.json();

        if (data.linhas_com_observacao_desktop !== undefined) {
            const observacaoDesktopElement = document.getElementById('linhasObservacaoDesktop');
            if (observacaoDesktopElement) {
                observacaoDesktopElement.textContent = data.linhas_com_observacao_desktop;
                atualizarResultadoDesktops();
            } else {
                console.error("Elemento 'linhasObservacaoDesktop' não encontrado.");
            }
        } else {
            console.error('Erro ao contar as linhas com observação e Desktop:', data.error);
        }
    } catch (error) {
        console.error('Erro ao contar as linhas com observação e Desktop:', error);
    }
}
function atualizarResultadoDesktops() {
    const totalDesktopsElement = document.getElementById('linhasDesktops');
    const observacaoDesktopElement = document.getElementById('linhasObservacaoDesktop');
    const resultadoDesktopElement = document.getElementById('resultadodesktop');

    if (totalDesktopsElement && observacaoDesktopElement && resultadoDesktopElement) {
        const totalDesktops = parseInt(totalDesktopsElement.textContent);
        const totalObservacaoDesktop = parseInt(observacaoDesktopElement.textContent);

        if (!isNaN(totalDesktops) && !isNaN(totalObservacaoDesktop)) {
            const resultado = totalDesktops - totalObservacaoDesktop;
            resultadoDesktopElement.textContent = resultado;
        }
    } else {
        console.error("Elementos necessários para 'atualizarResultadoDesktop' não foram encontrados.");
    }
}

async function contarLinhasNotebooks() {
    try {
        const response = await fetch('/contar_linhas_notebooks');
        const data = await response.json();

        if (data.linhas_notebooks !== undefined) {
            const totalNotebooksElement = document.getElementById('linhasNotebooks');
            if (totalNotebooksElement) {
                totalNotebooksElement.textContent = data.linhas_notebooks;
                atualizarResultadoNotebooks();
            } else {
                console.error("Elemento 'linhasNotebooks' não encontrado.");
            }
        } else {
            console.error('Erro ao contar as linhas de Notebooks:', data.error);
        }
    } catch (error) {
        console.error('Erro ao contar as linhas de Notebooks:', error);
    }
}
async function contarLinhasComObservacaoNotebooks() {
    try {
        const response = await fetch('/contar_linhas_com_observacao_notebooks');
        const data = await response.json();

        if (data.linhas_com_observacao_notebooks !== undefined) {
            const observacaoNotebooksElement = document.getElementById('linhasObservacaoNotebooks');
            if (observacaoNotebooksElement) {
                observacaoNotebooksElement.textContent = data.linhas_com_observacao_notebooks;
                atualizarResultadoNotebooks();
            } else {
                console.error("Elemento 'linhasObservacaoDesktop' não encontrado.");
            }
        } else {
            console.error('Erro ao contar as linhas com observação e Notebooks:', data.error);
        }
    } catch (error) {
        console.error('Erro ao contar as linhas com observação e Notebooks:', error);
    }
}
function atualizarResultadoNotebooks() {
    const totalNotebooksElement = document.getElementById('linhasNotebooks');
    const observacaoNotebooksElement = document.getElementById('linhasObservacaoNotebooks');
    const resultadoNotebooksElement = document.getElementById('resultadonotebooks');

    if (totalNotebooksElement && observacaoNotebooksElement && resultadoNotebooksElement) {
        const totalNotebooks = parseInt(totalNotebooksElement.textContent);
        const totalObservacaoNotebooks = parseInt(observacaoNotebooksElement.textContent);

        if (!isNaN(totalNotebooks) && !isNaN(totalObservacaoNotebooks)) {
            const resultado = totalNotebooks - totalObservacaoNotebooks;
            resultadoNotebooksElement.textContent = resultado;
        }
    } else {
        console.error("Elementos necessários para 'atualizarResultadoNotebooks' não foram encontrados.");
    }
}

//COMEÇO FUNÇÕES DASHBOARD TODOS
function contarLinhasPreenchidas() {
    fetch('/contar_linhas_preenchidas')
        .then(response => response.json())
        .then(data => {
            document.getElementById('linhasPreenchidas').textContent = data.linhas_preenchidas;
        })
        .catch(error => console.error('Erro ao contar as linhas preenchidas:', error));
}
contarLinhasPreenchidas();
function contarLinhasComObservacao() {
    fetch('/contar_linhas_com_observacao')
        .then(response => response.json())
        .then(data => {
            document.getElementById('linhasObservacao').textContent = data.linhas_com_observacao;
        })
        .catch(error => console.error('Erro ao contar as linhas com observação:', error));
}
contarLinhasComObservacao();

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifique a estrutura dos dados aqui

        // Contar a frequência de cada modelo
        const ModelCounts = data.reduce((acc, item) => {
            const modelo = item['ModeloDispositivo']; // Nome correto da coluna para o modelo
            if (modelo) {
                if (!acc[modelo]) {
                    acc[modelo] = { count: 0, details: [] };
                }
                acc[modelo].count++;
                
                // Acesse o nome do dispositivo
                const nomeDispositivo = item['NomeDispositivo'] || 'Sem Nome'; // Verifique o nome correto da coluna
                console.log(`Modelo: ${modelo}, Nome do Dispositivo: ${nomeDispositivo}`); // Debugging para ver o valor do nome
                
                const observacao = item['ObservacaoDispositivo'] || 'Nenhuma'; // Nome correto da coluna para observação
                acc[modelo].details.push({ modelo, nomeDispositivo, observacao });
            }
            return acc;
        }, {});

        const ModelLabels = Object.keys(ModelCounts);
        const ModelValues = ModelLabels.map(label => ModelCounts[label].count);
        const ModelDetails = ModelCounts; // Armazenar detalhes dos modelos

        const ctxModel = document.getElementById('ChartsModels');
        const chart = new Chart(ctxModel, {
            type: 'bar',
            data: {
                labels: ModelLabels,
                datasets: [{
                    data: ModelValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 0,
                        bottom: 16,
                    },
                },
                onClick: (event) => {
                    const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                    if (activePoints.length) {
                        const firstPoint = activePoints[0];
                        const modelo = ModelLabels[firstPoint.index];
                        displayModelDetails(ModelDetails[modelo].details);
                    }
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

function displayModelDetails(details) {
    const detailsList = document.getElementById('detailsList');
    detailsList.innerHTML = ''; // Limpa a lista existente

    details.forEach(detail => {
        // Formatar a string conforme desejado
        const listItem = document.createElement('li');
        listItem.textContent = `Modelo: ${detail.modelo}, Nome do Dispositivo: ${detail.nomeDispositivo}, Observação: ${detail.observacao}`;
        detailsList.appendChild(listItem);
    });

    const modelDetailsSection = document.getElementById('modelDetails');
    modelDetailsSection.style.display = 'block'; // Exibe a seção de detalhes
}



fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar dados para remover itens com a observação "Não possui"
        const filteredData = data.filter(item => item['ObservacaoDispositivo'] !== 'Não possui');
        
        // Contar a frequência de cada Tipo
        const ObservationCounts = filteredData.reduce((acc, item) => {
            const Observation = item['ObservacaoDispositivo'];
            if (Observation) {
                acc[Observation] = (acc[Observation] || 0) + 1;
            }
            return acc;
        }, {});

        const ObservationLabels = Object.keys(ObservationCounts);
        const ObservationValues = Object.values(ObservationCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsObservations');
        new Chart(ctxStatus, {
            type: 'bar',
            data: {
                labels: ObservationLabels,
                datasets: [{
                    label: 'Total Disponível',
                    data: ObservationValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 0,
                        bottom: 16,
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Contar a frequência de cada Tipo
        const TypeCounts = data.reduce((acc, item) => {
            const Type = item['TipoDispositivo'];
            if (Type) {
                acc[Type] = (acc[Type] || 0) + 1;
            }
            return acc;
        }, {});

        const TypeLabels = Object.keys(TypeCounts);
        const TypeValues = Object.values(TypeCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsTypes');
        new Chart(ctxStatus, {
            type: 'bar',
            data: {
                labels: TypeLabels,
                datasets: [{
                    data: TypeValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 0,
                        bottom: 16,
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
//FINAL FUNÇÕES DASHBOARD TODOS

//COMEÇO FUNÇÕES DASHBOARD DESKTOPS
function contarLinhasDesktops() {
    fetch('/contar_linhas_desktops')
        .then(response => response.json())
        .then(data => {
            if (data.linhas_desktops !== undefined) {
                totalDesktops = data.linhas_desktops;
                document.getElementById('linhasDesktops').textContent = totalDesktops;
                atualizarResultadoDesktops(); // Atualiza o resultado sempre que totalDesktops for atualizado
            } else {
                console.error('Erro ao contar as linhas de desktops:', data.error);
            }
        })
        .catch(error => console.error('Erro ao contar as linhas de desktops:', error));
}
function contarLinhasComObservacaoDesktop() {
    fetch('/contar_linhas_com_observacao_desktop')
        .then(response => response.json())
        .then(data => {
            if (data.linhas_com_observacao_desktop !== undefined) {
                totalObservacaoDesktop = data.linhas_com_observacao_desktop;
                document.getElementById('linhasObservacaoDesktop').textContent = totalObservacaoDesktop;
                atualizarResultadoDesktops(); // Atualiza o resultado sempre que totalObservacaoDesktop for atualizado
            } else {
                console.error('Erro ao contar as linhas com observação e Desktop:', data.error);
            }
        })
        .catch(error => console.error('Erro ao contar as linhas com observação e Desktop:', error));
}
function atualizarResultadoDesktops() {
    const totalDesktopsElement = document.getElementById('linhasDesktops');
    const observacaoDesktopElement = document.getElementById('linhasObservacaoDesktop');
    const resultadoDesktopElement = document.getElementById('resultadodesktop');

    if (totalDesktopsElement && observacaoDesktopElement && resultadoDesktopElement) {
        const totalDesktops = parseInt(totalDesktopsElement.textContent);
        const totalObservacaoDesktop = parseInt(observacaoDesktopElement.textContent);

        if (!isNaN(totalDesktops) && !isNaN(totalObservacaoDesktop)) {
            const resultado = totalDesktops - totalObservacaoDesktop;
            resultadoDesktopElement.textContent = resultado;
        }
    } else {
        console.error("Elementos necessários para 'atualizarResultadoDesktops' não foram encontrados.");
    }
}
contarLinhasDesktops();
contarLinhasComObservacaoDesktop();

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Desktop'
        const desktopData = data.filter(item => item['TipoDispositivo'] === 'Desktop');

        // Contar a frequência de cada modelo
        const ModelDesktop = desktopData.reduce((acc, item) => {
            const modelo = item['ModeloDispositivo'];
            if (modelo) {
                acc[modelo] = (acc[modelo] || 0) + 1;
            }
            return acc;
        }, {});

        const ModelDesktopLabels = Object.keys(ModelDesktop);
        const ModelDesktopValues = Object.values(ModelDesktop);

        const ctx = document.getElementById('ChartsModelDesktop');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ModelDesktopLabels,
                datasets: [{
                    label: 'Total Disponível',
                    data: ModelDesktopValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20,
                        left: 30,
                        right: 20
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Desktop'
        const desktopData = data.filter(item => item['TipoDispositivo'] === 'Desktop');

        // Filtrar dados para remover itens com a observação "Não possui"
        const filteredData = desktopData.filter(item => item['ObservacaoDispositivo'] !== 'Não possui');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const ObservationDesktopCounts = filteredData.reduce((acc, item) => {
            const Observation = item['ObservacaoDispositivo'];
            if (Observation) {
                acc[Observation] = (acc[Observation] || 0) + 1;
            }
            return acc;
        }, {});

        const ObservationDesktopLabels = Object.keys(ObservationDesktopCounts);
        const ObservationDesktopValues = Object.values(ObservationDesktopCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsObservationsDesktops').getContext('2d');
        new Chart(ctxStatus, {
            type: 'bar',
            data: {
                labels: ObservationDesktopLabels,
                datasets: [{
                    label: 'Total Disponível',
                    data: ObservationDesktopValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Desktop'
        const desktopData = data.filter(item => item['TipoDispositivo'] === 'Desktop');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const MemoryDesktopCounts = desktopData.reduce((acc, item) => {
            const Memory = item['MemoriaTotal'];
            if (Memory) {
                acc[Memory] = (acc[Memory] || 0) + 1;
            }
            return acc;
        }, {});

        const MemoryDesktopLabels = Object.keys(MemoryDesktopCounts);
        const MemoryDesktopValues = Object.values(MemoryDesktopCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsMemoryDesktops').getContext('2d');
        new Chart(ctxStatus, {
            type: 'pie',
            data: {
                labels: MemoryDesktopLabels,
                datasets: [{
                    label: 'Total Disponível',
                    data: MemoryDesktopValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Desktop'
        const desktopData = data.filter(item => item['TipoDispositivo'] === 'Desktop');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const StorangeDesktopCounts = desktopData.reduce((acc, item) => {
            const Storange = item['ArmazenamentoInterno'];
            if (Storange) {
                acc[Storange] = (acc[Storange] || 0) + 1;
            }
            return acc;
        }, {});

        const StorangeDesktopLabels = Object.keys(StorangeDesktopCounts);
        const StorangeDesktopValues = Object.values(StorangeDesktopCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsStorangeDesktops').getContext('2d');
        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: StorangeDesktopLabels,
                datasets: [{
                    label: 'Total Disponível',
                    data: StorangeDesktopValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Desktop'
        const desktopData = data.filter(item => item['TipoDispositivo'] === 'Desktop');

        // Contar a frequência de cada modelo
        const processorDesktopCount = desktopData.reduce((acc, item) => {
            const processor = item['ProcessadorUsado'];
            if (processor) {
                acc[processor] = (acc[processor] || 0) + 1;
            }
            return acc;
        }, {});

        const processorDesktopLabels = Object.keys(processorDesktopCount);
        const processorDesktopValues = Object.values(processorDesktopCount);

        const ctx = document.getElementById('ChartsProcessorDesktop');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: processorDesktopLabels,
                datasets: [{
                    data: processorDesktopValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20,
                        left: 30,
                        right: 20
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
//FIM FUNÇÕES DASHBOARD DESKTOPS


//COMEÇO FUNÇÕES DASHBOARD NOTEBOOKS
function contarLinhasNotebooks() {
    fetch('/contar_linhas_notebooks')
        .then(response => response.json())
        .then(data => {
            if (data.linhas_notebooks !== undefined) {
                totalNotebooks = data.linhas_notebooks;
                document.getElementById('linhasNotebooks').textContent = totalNotebooks;
                atualizarResultadoNotebooks(); // Atualiza o resultado sempre que totalNotebooks for atualizado
            } else {
                console.error('Erro ao contar as linhas de notebooks:', data.error);
            }
        })
        .catch(error => console.error('Erro ao contar as linhas de notebooks:', error));
}
function contarLinhasComObservacaoNotebooks() {
    fetch('/contar_linhas_com_observacao_notebook')
        .then(response => response.json())
        .then(data => {
            if (data.linhas_com_observacao_notebook !== undefined) {
                totalObservacaoNotebooks = data.linhas_com_observacao_notebook;
                document.getElementById('linhasObservacaoNotebook').textContent = totalObservacaoNotebooks;
                atualizarResultadoNotebooks(); // Atualiza o resultado sempre que totalObservacaoNotebooks for atualizado
            } else {
                console.error('Erro ao contar as linhas com observação e Notebooks:', data.error);
            }
        })
        .catch(error => console.error('Erro ao contar as linhas com observação e Notebooks:', error));
}
function atualizarResultadoNotebooks() {
    const totalNotebooksElement = document.getElementById('linhasNotebooks');
    const observacaoNotebooksElement = document.getElementById('linhasObservacaoNotebook');
    const resultadoNotebooksElement = document.getElementById('resultadonotebooks');

    if (totalNotebooksElement && observacaoNotebooksElement && resultadoNotebooksElement) {
        const totalNotebooks = parseInt(totalNotebooksElement.textContent);
        const totalObservacaoNotebooks = parseInt(observacaoNotebooksElement.textContent);

        if (!isNaN(totalNotebooks) && !isNaN(totalObservacaoNotebooks)) {
            const resultado = totalNotebooks - totalObservacaoNotebooks;
            resultadoNotebooksElement.textContent = resultado;
        }
    } else {
        console.error("Elementos necessários para 'atualizarResultadoDesktops' não foram encontrados.");
    }
}
contarLinhasNotebooks();
contarLinhasComObservacaoNotebooks();

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Notebook'
        const notebookData = data.filter(item => item['TipoDispositivo'] === 'Notebook');

        // Contar a frequência de cada modelo
        const ModelNotebooks = notebookData.reduce((acc, item) => {
            const modelo = item['ModeloDispositivo'];
            if (modelo) {
                acc[modelo] = (acc[modelo] || 0) + 1;
            }
            return acc;
        }, {});

        const ModelNotebooksLabels = Object.keys(ModelNotebooks);
        const ModelNotebooksValues = Object.values(ModelNotebooks);

        const ctx = document.getElementById('ChartsModelNotebooks');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ModelNotebooksLabels,
                datasets: [{
                    data: ModelNotebooksValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20,
                        left: 30,
                        right: 20
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Notebook'
        const notebookData = data.filter(item => item['TipoDispositivo'] === 'Notebook');

        // Filtrar dados para remover itens com a observação "Não possui"
        const filteredData = notebookData.filter(item => item['ObservacaoDispositivo'] !== 'Não possui');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const ObservationNotebookCounts = filteredData.reduce((acc, item) => {
            const Observation = item['ObservacaoDispositivo'];
            if (Observation) {
                acc[Observation] = (acc[Observation] || 0) + 1;
            }
            return acc;
        }, {});

        const ObservationNotebookLabels = Object.keys(ObservationNotebookCounts);
        const ObservationNotebookValues = Object.values(ObservationNotebookCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsObservationsNotebooks').getContext('2d');
        new Chart(ctxStatus, {
            type: 'bar',
            data: {
                labels: ObservationNotebookLabels,
                datasets: [{
                    data: ObservationNotebookValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Notebook'
        const notebookData = data.filter(item => item['TipoDispositivo'] === 'Notebook');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const MemoryNotebookCounts = notebookData.reduce((acc, item) => {
            const Memory = item['MemoriaTotal'];
            if (Memory) {
                acc[Memory] = (acc[Memory] || 0) + 1;
            }
            return acc;
        }, {});

        const MemoryNotebookLabels = Object.keys(MemoryNotebookCounts);
        const MemoryNotebookValues = Object.values(MemoryNotebookCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsMemoryNotebooks').getContext('2d');
        new Chart(ctxStatus, {
            type: 'pie',
            data: {
                labels: MemoryNotebookLabels,
                datasets: [{
                    data: MemoryNotebookValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Notebook'
        const notebookData = data.filter(item => item['TipoDispositivo'] === 'Notebook');

        // Contar a frequência de cada Observação entre os dispositivos filtrados
        const StorangeNotebookCounts = notebookData.reduce((acc, item) => {
            const Storange = item['ArmazenamentoInterno'];
            if (Storange) {
                acc[Storange] = (acc[Storange] || 0) + 1;
            }
            return acc;
        }, {});

        const StorangeNotebookLabels = Object.keys(StorangeNotebookCounts);
        const StorangeNotebookValues = Object.values(StorangeNotebookCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsStorangeNotebooks').getContext('2d');
        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: StorangeNotebookLabels,
                datasets: [{
                    data: StorangeNotebookValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: 10
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Filtrar apenas as linhas onde TipoDispositivo é 'Notebook'
        const notebookData = data.filter(item => item['TipoDispositivo'] === 'Notebook');

        // Contar a frequência de cada modelo
        const processorNotebookCount = notebookData.reduce((acc, item) => {
            const processor = item['ProcessadorUsado'];
            if (processor) {
                acc[processor] = (acc[processor] || 0) + 1;
            }
            return acc;
        }, {});

        const processorNotebookLabels = Object.keys(processorNotebookCount);
        const processorNotebookValues = Object.values(processorNotebookCount);

        const ctx = document.getElementById('ChartsProcessorNotebooks');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: processorNotebookLabels,
                datasets: [{
                    data: processorNotebookValues,
                    backgroundColor: '#07547398',
                    borderColor: '#075473',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20,
                        left: 30,
                        right: 20
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
//FIM FUNÇÕES DASHBOARD NOTEBOOKS

//FUNÇÕES COMPLEMENTARES DASHBOARD
function navigateToLink() {
    var select = document.getElementById('deviceType');
    var selectedValue = select.value;
    if (selectedValue) {
      window.location.href = selectedValue;
    }
}

function visualizarEstoque() {
    fetch('https://goupjsapi.onrender.com/visualizar_estoque')
    .then(response => response.json())
    .then(data => {
        exibirTabelaEstoque(data);
    })
    .catch(error => console.error('Erro:', error));
}

function exibirTabelaEstoque(data) {
    const tabela = document.getElementById('tabelaEstoque');
    tabela.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

    if (data.length > 0) {
        const colunasOrdem = ['SerialDispositivo', 'NomeDispositivo', 'ModeloDispositivo', 'ObservacaoDispositivo', 'TipoDispositivo']; 

        // Adiciona cabeçalhos com selects para filtros
        const headerRow = document.createElement('tr');
        colunasOrdem.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;

            // Cria o select para o filtro
            const select = document.createElement('select');
            const todasOpcoes = [...new Set(data.map(row => row[header]))]; // Obtém opções únicas
            const optionVazia = document.createElement('option');
            optionVazia.value = '';
            optionVazia.textContent = `Filtrar ${header}`;
            select.appendChild(optionVazia);

            todasOpcoes.forEach(opcao => {
                const option = document.createElement('option');
                option.value = opcao;
                option.textContent = opcao;
                select.appendChild(option);
            });

            select.addEventListener('change', function() {
                aplicarFiltros(data);
            });

            th.appendChild(select);
            headerRow.appendChild(th);
        });
        tabela.appendChild(headerRow);

        // Função para aplicar filtros
        function aplicarFiltros(data) {
            const filtros = {};
            headerRow.querySelectorAll('select').forEach((select, index) => {
                const coluna = colunasOrdem[index];
                filtros[coluna] = select.value;
            });

            const dadosFiltrados = data.filter(row => {
                return colunasOrdem.every(coluna => {
                    return filtros[coluna] === '' || row[coluna] === filtros[coluna];
                });
            });
            
            // Limpa e exibe os dados filtrados
            tabela.innerHTML = "";
            tabela.appendChild(headerRow); // Adiciona os cabeçalhos novamente
            exibirDados(dadosFiltrados);
        }

        // Função para exibir dados
        function exibirDados(data) {
            data.forEach(row => {
                const rowElement = document.createElement('tr');
                colunasOrdem.forEach(header => {
                    const cell = document.createElement('td');
                    cell.textContent = row[header] || ''; // Se o valor for nulo, deixa em branco
                    rowElement.appendChild(cell);
                });
                tabela.appendChild(rowElement);
            });
        }

        exibirDados(data); // Exibe os dados iniciais
    }
}

function visualizarEstoqueDesktop() {
    fetch('https://goupjsapi.onrender.com/visualizar_estoque_desktop')
    .then(response => response.json())
    .then(data => {
        exibirTabelaEstoqueComFiltroDesktop(data);
    })
    .catch(error => console.error('Erro:', error));
}

function exibirTabelaEstoqueComFiltroDesktop(data) {
    const tabela = document.getElementById('tabelaEstoqueDesktop');
    tabela.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

    if (data.length > 0) {
        const colunasOrdem = ['SerialDispositivo', 'NomeDispositivo', 'ModeloDispositivo', 'ProcessadorUsado', 'MemoriaTotal', 'TipoDispositivo'];

        // Adiciona cabeçalhos com selects para filtros
        const headerRow = document.createElement('tr');
        colunasOrdem.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;

            // Cria o select para o filtro, exceto para "TipoDispositivo"
            if (header !== 'TipoDispositivo') {
                const select = document.createElement('select');
                const todasOpcoes = [...new Set(data.map(row => row[header]))]; // Obtém opções únicas
                const optionVazia = document.createElement('option');
                optionVazia.value = '';
                optionVazia.textContent = `Filtrar ${header}`;
                select.appendChild(optionVazia);

                todasOpcoes.forEach(opcao => {
                    const option = document.createElement('option');
                    option.value = opcao;
                    option.textContent = opcao;
                    select.appendChild(option);
                });

                select.addEventListener('change', function() {
                    aplicarFiltros(data);
                });

                th.appendChild(select);
            }

            headerRow.appendChild(th);
        });
        tabela.appendChild(headerRow);

        // Função para aplicar filtros
        function aplicarFiltros(data) {
            const filtros = { 'TipoDispositivo': 'Desktop' }; // Filtro automático para "TipoDispositivo"
            headerRow.querySelectorAll('select').forEach((select, index) => {
                const coluna = colunasOrdem[index];
                if (coluna !== 'TipoDispositivo') {
                    filtros[coluna] = select.value;
                }
            });

            const dadosFiltrados = data.filter(row => {
                return colunasOrdem.every(coluna => {
                    return (filtros[coluna] === '' || row[coluna] === filtros[coluna]);
                });
            });
            
            // Limpa e exibe os dados filtrados
            tabela.innerHTML = "";
            tabela.appendChild(headerRow); // Adiciona os cabeçalhos novamente
            exibirDados(dadosFiltrados);
        }

        // Função para exibir dados
        function exibirDados(data) {
            data.forEach(row => {
                const rowElement = document.createElement('tr');
                colunasOrdem.forEach(header => {
                    const cell = document.createElement('td');
                    cell.textContent = row[header] || ''; // Se o valor for nulo, deixa em branco
                    rowElement.appendChild(cell);
                });
                tabela.appendChild(rowElement);
            });
        }

        // Aplica o filtro de "Desktop" automaticamente na primeira exibição
        aplicarFiltros(data);
    }
}

function visualizarEstoqueNotebook() {
    fetch('https://goupjsapi.onrender.com/visualizar_estoque_notebook')
    .then(response => response.json())
    .then(data => {
        exibirTabelaEstoqueComFiltroNotebook(data);
    })
    .catch(error => console.error('Erro:', error));
}

function exibirTabelaEstoqueComFiltroNotebook(data) {
    const tabela = document.getElementById('tabelaEstoqueNotebook');
    tabela.innerHTML = ""; // Limpa a tabela antes de adicionar novos dados

    if (data.length > 0) {
        const colunasOrdem = ['SerialDispositivo', 'NomeDispositivo', 'ModeloDispositivo', 'ProcessadorUsado', 'MemoriaTotal', 'TipoDispositivo'];

        // Adiciona cabeçalhos com selects para filtros
        const headerRow = document.createElement('tr');
        colunasOrdem.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;

            // Cria o select para o filtro, exceto para "TipoDispositivo"
            if (header !== 'TipoDispositivo') {
                const select = document.createElement('select');
                const todasOpcoes = [...new Set(data.map(row => row[header]))]; // Obtém opções únicas
                const optionVazia = document.createElement('option');
                optionVazia.value = '';
                optionVazia.textContent = `Filtrar ${header}`;
                select.appendChild(optionVazia);

                todasOpcoes.forEach(opcao => {
                    const option = document.createElement('option');
                    option.value = opcao;
                    option.textContent = opcao;
                    select.appendChild(option);
                });

                select.addEventListener('change', function() {
                    aplicarFiltros(data);
                });

                th.appendChild(select);
            }

            headerRow.appendChild(th);
        });
        tabela.appendChild(headerRow);

        // Função para aplicar filtros
        function aplicarFiltros(data) {
            const filtros = { 'TipoDispositivo': 'Notebook' }; // Filtro automático para "TipoDispositivo"
            headerRow.querySelectorAll('select').forEach((select, index) => {
                const coluna = colunasOrdem[index];
                if (coluna !== 'TipoDispositivo') {
                    filtros[coluna] = select.value;
                }
            });

            const dadosFiltrados = data.filter(row => {
                return colunasOrdem.every(coluna => {
                    return (filtros[coluna] === '' || row[coluna] === filtros[coluna]);
                });
            });
            
            // Limpa e exibe os dados filtrados
            tabela.innerHTML = "";
            tabela.appendChild(headerRow); // Adiciona os cabeçalhos novamente
            exibirDados(dadosFiltrados);
        }

        // Função para exibir dados
        function exibirDados(data) {
            data.forEach(row => {
                const rowElement = document.createElement('tr');
                colunasOrdem.forEach(header => {
                    const cell = document.createElement('td');
                    cell.textContent = row[header] || ''; // Se o valor for nulo, deixa em branco
                    rowElement.appendChild(cell);
                });
                tabela.appendChild(rowElement);
            });
        }

        // Aplica o filtro de "Desktop" automaticamente na primeira exibição
        aplicarFiltros(data);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Função para buscar o serial
    function buscarSerial(event) {
        const button = event.target.closest('button');
        const input = button.nextElementSibling;

        const serial = input.value;

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
    document.querySelectorAll('.sideMenuSearch button, .dashboardSearch button').forEach(button => {
        button.addEventListener('click', buscarSerial);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const exportarEstoqueBtn = document.getElementById('exportarEstoqueBtn');

    exportarEstoqueBtn.addEventListener('click', function() {
        // Fazer a requisição para exportar a planilha de estoque
        fetch('/exportar_planilha_estoque')
            .then(response => {
                if (response.ok) {
                    // Iniciar o download da planilha de estoque
                    return response.blob();
                } else {
                    throw new Error('Erro ao exportar a planilha de estoque.');
                }
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'planilha_estoque.xlsx';  // Nome do arquivo ao ser baixado
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Ocorreu um erro ao tentar exportar a planilha de estoque.');
            });
    });
});
