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
    });

    const deviceTypeSelect = document.getElementById('deviceType');
    const contentArea = document.getElementById('contentArea');

    let charts = [];

    function updateContent(selectedValue) {
        let content = '';

        switch (selectedValue) {
            case 'todos':
                content = `
                <div class="dashboardCharts">
                    <div class="dashboardChartsUp">
                        <div class="dashboardChartDetails">
                            <label>Com Detalhes</label>
                            <h1 id="linhasObservacao"></h1>
                        </div>
                        <div class="dashboardChartAvailable">
                            <label>Total Disponível</label>
                            <h1 id="linhasPreenchidas"></h1>
                        </div>
                    </div>
                    <div class="dashboardChartsDown">
                        <div class="dashboardChartsLeft">
                            <div class="dashboardChartsModels">
                                <label>Modelos</label>
                                <canvas id="ChartsModels"></canvas>
                            </div>
                        </div>
                        <div class="dashboardChartsRight">
                            <div class="dashboardChartStats">
                                <label>Status</label>
                                <canvas id="ChartsObservations"></canvas>
                            </div>
                            <div class="dashboardChartAmount">
                                <label>Disponíveis</label>
                                <canvas id="ChartsTypes"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                break;
            case 'desktops':
                content = `
                <div class="dashboardCharts">
                    <div class="dashboardChartsUp">
                        <div class="dashboardChartAvailableDesk">
                            <label>Total Disponível</label>
                            <h1 id="linhasDesktops"></h1>
                        </div>
                        <div class="dashboardChartDetailsDesk">
                            <label>Com Detalhes</label>
                            <h1 id="linhasObservacaoDesktop"></h1>
                        </div>
                        <div class="dashboardChartUseDesk">
                            <label>Pronto para Uso</label>
                            <h1 id="resultadodesktop"></h1>
                        </div>
                    </div>
                    <div class="dashboardChartsDown">
                        <div class="dashboardChartsLeftEquip">
                            <div class="dashboardChartsModels">
                                <label>Modelos</label>
                                <canvas id="ChartsModelDesktop"></canvas>
                            </div>
                        </div>
                        <div class="dashboardChartsRightEquip">
                            <div class="dashboardChartsRightUp">
                                <div class="dashboardChartDetailsUp">
                                    <label>Detalhes</label>
                                    <canvas id="ChartsObservationsDesktops"></canvas>
                                </div>
                                <div class="dashboardChartStorange">
                                    <label>Armazenamento</label>
                                    <canvas id="ChartsStorangeDesktops"></canvas>
                                </div>
                            </div>
                            <div class="dashboardChartsRightDown">
                                <div class="dashboardChartRam">
                                    <label>Memória</label>
                                    <canvas id="ChartsMemoryDesktops"></canvas>
                                </div>
                                <div class="dashboardChartProcessor">
                                    <label>Processador</label>
                                    <canvas id="ChartsProcessorDesktop"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                break;
            // Adicione outros casos como notebooks, monitores, etc.
        }

        // Limpa gráficos existentes
        destroyCharts();

        // Atualiza o conteúdo
        contentArea.innerHTML = content;

        // Atualiza o dashboard com novos gráficos e dados
        updateDashboard(selectedValue);
    }

    function destroyCharts() {
        charts.forEach(chart => chart.destroy());
        charts = [];
    }

    async function updateDashboard(selectedValue) {
        console.log(`Atualizando dashboard para: ${selectedValue}`);
        const models = await fetchDeviceModels();

        if (selectedValue === 'todos') {
            console.log("Atualizando gráficos e contagens para 'todos'");
            contarLinhasPreenchidas();
            contarLinhasComObservacao();
            createChart('ChartsModels', models.map(model => model.ModeloDispositivo), models.map(model => model.Quantidade));
            // Adicione as chamadas para criar gráficos específicos de 'todos'
        } else if (selectedValue === 'desktops') {
            console.log("Atualizando gráficos e contagens para 'desktops'");
            contarLinhasDesktops();
            contarLinhasComObservacaoDesktop();
            createChart('ChartsModelDesktop', models.map(model => model.ModeloDispositivo), models.map(model => model.Quantidade));
            // Adicione as chamadas para criar gráficos específicos de 'desktops'
        }
        // Adicione mais verificações para outros tipos de dispositivos se necessário
    }
    async function contarLinhasDesktops() {
        try {
            const response = await fetch('/contar_linhas_desktops');
            const data = await response.json();

            if (data.linhas_desktops !== undefined) {
                const totalDesktopsElement = document.getElementById('linhasDesktops');
                if (totalDesktopsElement) {
                    totalDesktopsElement.textContent = data.linhas_desktops;
                    atualizarResultado(); // Atualiza o resultado sempre que totalDesktops for atualizado
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
                    atualizarResultado(); // Atualiza o resultado sempre que totalObservacaoDesktop for atualizado
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

    function atualizarResultado() {
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
            console.error("Elementos necessários para 'atualizarResultado' não foram encontrados.");
        }
    }
    function createChart(canvasId, labels, data) {
        const ctx = document.getElementById(canvasId);
        if (ctx) {
            const chart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
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
            charts.push(chart);
        } else {
            console.error(`Canvas com ID ${canvasId} não encontrado.`);
        }
    }

    deviceTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value.toLowerCase();
        updateContent(selectedValue);
    });
    updateContent(deviceTypeSelect.value.toLowerCase());

    async function fetchDeviceModels() {
        try {
            const response = await fetch("/get_device_info");
            if (!response.ok) throw new Error("Erro ao buscar modelos: " + response.status);
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar modelos:", error);
            return [];
        }
    }
});

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
        // Contar a frequência de cada modelo
        const ModelCounts = data.reduce((acc, item) => {
            const modelo = item['ModeloDispositivo'];
            if (modelo) {
                acc[modelo] = (acc[modelo] || 0) + 1;
            }
            return acc;
        }, {});

        const ModelLabels = Object.keys(ModelCounts);
        const ModelValues = Object.values(ModelCounts);

        const ctxModel = document.getElementById('ChartsModels');
        new Chart(ctxModel, {
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
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

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
                atualizarResultado(); // Atualiza o resultado sempre que totalDesktops for atualizado
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
                atualizarResultado(); // Atualiza o resultado sempre que totalObservacaoDesktop for atualizado
            } else {
                console.error('Erro ao contar as linhas com observação e Desktop:', data.error);
            }
        })
        .catch(error => console.error('Erro ao contar as linhas com observação e Desktop:', error));
}
function atualizarResultado() {
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
        console.error("Elementos necessários para 'atualizarResultado' não foram encontrados.");
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
//FIM FUNÇÕES DASHBOARD NOTEBOOKS
