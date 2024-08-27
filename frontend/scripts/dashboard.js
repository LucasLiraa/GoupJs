document.addEventListener("DOMContentLoaded", function() {
    const body = document.querySelector("body"),
          sidebar = body.querySelector(".sideMenu"),
          toggle = body.querySelector(".toggle"),
          modeSwitch = body.querySelector(".sideMenuToggle"),
          modeText = body.querySelector(".sideMenuModeText");

    // Alternar o menu lateral
    toggle.addEventListener("click", () =>{
        sidebar.classList.toggle("close");
    });

    // Alternar modo claro/escuro
    modeSwitch.addEventListener("click", () =>{
        body.classList.toggle("dark");

        if(body.classList.contains("dark")){
            modeText.innerText = "Light Mode";
        } else {
            modeText.innerText = "Dark Mode";
        }
    });

    // Atualizar conteúdo baseado na seleção de tipo de dispositivo
    const deviceTypeSelect = document.getElementById('deviceType');
    const contentArea = document.getElementById('contentArea');

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
                            <h1 id="totalLinhas"></h1>
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
                            <div class="dashboardChartAvailable">
                                <label>Total Disponível</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartDetails">
                                <label>Com Detalhes</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartUse">
                                <label>Pronto para Uso</label>
                                <h1></h1>
                            </div>
                        </div>
                        <div class="dashboardChartsDown">
                            <div class="dashboardChartsLeftEquip">
                                <div class="dashboardChartsModels">
                                    <label>Modelos</label>
                                </div>
                            </div>
                            <div class="dashboardChartsRightEquip">
                                <div class="dashboardChartsRightUp">
                                    <div class="dashboardChartDetailsUp">
                                        <label>Detalhes</label>
                                    </div>
                                    <div class="dashboardChartStorange">
                                        <label>Armazenamento</label>
                                    </div>
                                </div>
                                <div class="dashboardChartsRightDown">
                                    <div class="dashboardChartRam">
                                        <label>Memória</label>
                                    </div>
                                    <div class="dashboardChartProcessor">
                                        <label>Processador</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    break;
                case 'notebooks':
                    content = `
                    <div class="dashboardCharts">
                        <div class="dashboardChartsUp">
                            <div class="dashboardChartAvailable">
                                <label>Total Disponível</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartDetails">
                                <label>Com Detalhes</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartUse">
                                <label>Pronto para Uso</label>
                                <h1></h1>
                            </div>
                        </div>
                        <div class="dashboardChartsDown">
                            <div class="dashboardChartsLeftEquip">
                                <div class="dashboardChartsModels">
                                    <label>Modelos</label>
                                </div>
                            </div>
                            <div class="dashboardChartsRightEquip">
                                <div class="dashboardChartsRightUp">
                                    <div class="dashboardChartDetailsUp">
                                        <label>Detalhes</label>
                                    </div>
                                    <div class="dashboardChartStorange">
                                        <label>Armazenamento</label>
                                    </div>
                                </div>
                                <div class="dashboardChartsRightDown">
                                    <div class="dashboardChartRam">
                                        <label>Memória</label>
                                    </div>
                                    <div class="dashboardChartProcessor">
                                        <label>Processador</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    break;
                case 'monitores':
                    content = `
                    <div class="dashboardCharts">
                        <div class="dashboardChartsUp">
                            <div class="dashboardChartAvailable">
                                <label>Total Disponível</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartDetails">
                                <label>Com Detalhes</label>
                                <h1></h1>
                            </div>
                            <div class="dashboardChartUse">
                                <label>Pronto para Uso</label>
                                <h1></h1>
                            </div>
                        </div>
                        <div class="dashboardChartsDown">
                            <div class="dashboardChartsLeftEquip">
                                <div class="dashboardChartsModels">
                                    <label>Modelos</label>
                                </div>
                            </div>
                            <div class="dashboardChartsRightEquip">
                                <div class="dashboardChartsRightUp">
                                    <div class="dashboardChartDetailsMonitor">
                                        <label>Detalhes</label>
                                    </div>
                                </div>
                                <div class="dashboardChartsRightDown">
                                    <div class="dashboardChartAdapter">
                                        <label>Memória</label>
                                    </div>
                                    <div class="dashboardChartDisplayport">
                                        <label>Processador</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    break;
            case 'perifericos':
                content = 'Periféricos';
                break;
            default:
                content = '<p>Selecione um tipo de dispositivo para ver mais detalhes.</p>';
        }

        contentArea.innerHTML = content;

        // Atualizar o dashboard para o tipo de dispositivo selecionado
        if (selectedValue === 'todos') {
            updateDashboard();
        }
    }

    deviceTypeSelect.addEventListener('change', function() {
        const selectedValue = this.value.toLowerCase();
        updateContent(selectedValue);
    });

    updateContent(deviceTypeSelect.value.toLowerCase());

    contarLinhas();

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

    async function updateDashboard() {
        const models = await fetchDeviceModels();
    
        const modelList = document.getElementById("modelList");
        const statusList = document.getElementById("statusList");
        const amountList = document.getElementById("amountList");
    
        if (modelList) {
            modelList.innerHTML = models.map(model => `<li>${model.ModeloDispositivo}</li>`).join('');
        } else {
            console.error("Elemento modelList não encontrado.");
        }
    
        if (statusList) {
            statusList.innerHTML = models.map(model => `<li>${model.ObservacaoDispositivo}</li>`).join('');
        } else {
            console.error("Elemento statusList não encontrado.");
        }
    
        if (amountList) {
            amountList.innerHTML = models.map(model => `<li>${model.TipoDispositivo}</li>`).join('');
        } else {
            console.error("Elemento amountList não encontrado.");
        }
    
        // Após atualizar o conteúdo, certifique-se de que o gráfico está sendo atualizado corretamente
        const ctx = document.getElementById('ChartsModels');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: models.map(model => model.ModeloDispositivo),
                    datasets: [{
                        label: 'Total Disponível',
                        data: models.map(model => model.Quantidade),
                        backgroundColor: '#695cfe98',
                        borderColor: '#695CFE',
                        borderWidth: 3,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y', // Configura o gráfico para barras horizontais
                }
            });
        } else {
            console.error("Elemento ChartsModels não encontrado.");
        }
    }    
});


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

        const labels = Object.keys(ModelCounts);
        const values = Object.values(ModelCounts);

        const ctx = document.getElementById('ChartsModels');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Disponível',
                    data: values,
                    backgroundColor: '#695cfe98',
                    borderColor: '#695CFE',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y', // Configura o gráfico para barras horizontais
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));

fetch('/get_device_info')
    .then(response => response.json())
    .then(data => {
        // Contar a frequência de cada Tipo
        const ObservationCounts = data.reduce((acc, item) => {
            const Observation = item['ObservacaoDispositivo'];
            if (Observation) {
                acc[Observation] = (acc[Observation] || 0) + 1;
            }
            return acc;
        }, {});

        const ObservationLabels = Object.keys(ObservationCounts);
        const ObservationValues = Object.values(ObservationCounts);

        // Criar o gráfico de status
        const ctxStatus = document.getElementById('ChartsObservations'); // Certifique-se de ter uma <canvas id="ChartsTypes"> no HTML
        new Chart(ctxStatus, {
            type: 'bar', // Tipo de gráfico, pode ser 'pie' ou 'doughnut'
            data: {
                labels: ObservationLabels,
                datasets: [{
                    label: 'Total',
                    data: ObservationValues,
                    backgroundColor: '#695cfe98',
                    borderColor: '#695CFE',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y', // Configura o gráfico para barras horizontais
                plugins: {
                    responsive: true,
                    legend: {
                        position: 'right',
                    },
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
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
        const ctxStatus = document.getElementById('ChartsTypes'); // Certifique-se de ter uma <canvas id="ChartsTypes"> no HTML
        new Chart(ctxStatus, {
            type: 'bar', // Tipo de gráfico, pode ser 'pie' ou 'doughnut'
            data: {
                labels: TypeLabels,
                datasets: [{
                    label: 'Total',
                    data: TypeValues,
                    backgroundColor: '#695cfe98',
                    borderColor: '#695CFE',
                    borderWidth: 3,
                    borderRadius: 6
                }]
            },
            options: {
                layout: {
                    padding: 0
                },
                plugins: {
                    responsive: true,
                    legend: {
                        position: 'right',
                    },
                }
            }
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));




    function contarLinhas() {
        fetch('/contar_linhas')
            .then(response => response.json())
            .then(data => {
                document.getElementById('totalLinhas').textContent = data.linhas_preenchidas;
            })
            .catch(error => console.error('Erro ao contar as linhas:', error));
    }

    contarLinhas();

    function contarLinhasComObservacao() {
        fetch('/contar_linhas_com_observacao')
            .then(response => response.json())
            .then(data => {
                document.getElementById('linhasObservacao').textContent = data.linhas_com_observacao;
            })
            .catch(error => console.error('Erro ao contar as linhas com observação:', error));
    }

    contarLinhasComObservacao();