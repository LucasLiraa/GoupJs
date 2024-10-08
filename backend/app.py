from flask import Flask, send_from_directory, request, jsonify
from flask import send_file
import pandas as pd
import os
import re
app = Flask(__name__)

# Diretório do frontend
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

# Caminhos para os arquivos de estoque
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CAMINHO_CONSULTA = os.path.join(BASE_DIR, 'data', 'Relatório de Dispositivos 24-09-24.xlsx')
CAMINHO_ESTOQUE = os.path.join(BASE_DIR, 'data', 'Estoque atual.xlsx')
CAMINHO_COTACAO = os.path.join(BASE_DIR, 'data', 'Cotacao.xlsx')
CAMINHO_DESCARTE = os.path.join(BASE_DIR, 'data', 'Descarte.xlsx')

#COMEÇO BACKEND CONTROLE DE EQUIPAMENTOS
@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

def verificarDispositivoOuPeriferico(mensagem):
    # Verificar se a mensagem contém o comando de exclusão com tipo de dispositivo
    padrao_excluir_tipo = r'\bExcluir\s+(teclado|mouse|displayport|adaptador)\b'
    match_excluir_tipo = re.search(padrao_excluir_tipo, mensagem, re.IGNORECASE)

    # Verificar se é um serial (Desktop ou Notebook)
    padrao_serial = r'\b[A-Z0-9]{6,}\b'
    match_serial = re.search(padrao_serial, mensagem)
    
    # Verificar se é um periférico (Monitor, Teclado, Mouse)
    padrao_periferico = r'\b(|teclado|mouse|displayport|adaptador)\b'
    match_periferico = re.search(padrao_periferico, mensagem, re.IGNORECASE)
    
    if match_excluir_tipo:
        # Retorna o tipo de dispositivo para exclusão (ex: "Mouse", "Teclado")
        return 'tipo', match_excluir_tipo.group(1).capitalize()  # Retorna o tipo de dispositivo com a primeira letra maiúscula
    elif match_serial:
        # Retorna o serial para exclusão
        return 'dispositivo', match_serial.group()
    elif match_periferico:
        # Retorna o periférico se for identificado fora do contexto de exclusão
        return 'periferico', match_periferico.group().capitalize()
    else:
        return None, None

def consultDados(Serial):
    try:
        df = pd.read_excel(CAMINHO_CONSULTA)
        if Serial:
            resultado = df[df['NÚMERO DO SERIAL'] == Serial]
            if not resultado.empty:
                NomeDispositivo = resultado['NOME DO DISPOSITIVO'].iloc[0]
                ModeloDispositivo = resultado['APELIDO'].iloc[0]
                SerialDispositivo = resultado['NÚMERO DO SERIAL'].iloc[0]
                ProcessadorUsado = resultado['PROCESSADOR'].iloc[0]
                MemoriaTotal = resultado['MEMÓRIA RAM TOTAL'].iloc[0]
                ArmazenamentoInterno = resultado['ARMAZENAMENTO INTERNO TOTAL'].iloc[0]
                ObservacaoDispositivo = resultado['OBSERVAÇÃO DO DISPOSITIVO'].iloc[0]
                return True, NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo
        return False, None, None, None, None, None, None, None
    except Exception as e:
        return False, f"Erro ao consultar a planilha de estoque: {e}", None, None, None, None, None, None

def adicDados(NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo, TipoDispositivo): 
    try:
        nova_linha = pd.DataFrame({
            'NomeDispositivo': [NomeDispositivo if NomeDispositivo else 'Não possui'],
            'ModeloDispositivo': [ModeloDispositivo if ModeloDispositivo else 'Não possui'],
            'SerialDispositivo': [SerialDispositivo],
            'ProcessadorUsado': [ProcessadorUsado if ProcessadorUsado else 'Não possui'],
            'MemoriaTotal': [MemoriaTotal if MemoriaTotal else 'Não possui'],
            'ArmazenamentoInterno': [ArmazenamentoInterno if ArmazenamentoInterno else 'Não possui'],
            'ObservacaoDispositivo': [ObservacaoDispositivo if ObservacaoDispositivo else 'Não possui'],
            'TipoDispositivo': [TipoDispositivo if TipoDispositivo else 'Não possui']
        })
        
        df = pd.read_excel(CAMINHO_ESTOQUE)
        df = pd.concat([df, nova_linha], ignore_index=True)
        df.to_excel(CAMINHO_ESTOQUE, index=False)
        return "Dispositivo adicionado ao estoque."
    except Exception as e:
        return f"Erro ao adicionar dispositivo à planilha de estoque: {e}"

def adicDadosPeriferico(ModeloDispositivo, SerialDispositivo, TipoDispositivo, ObservacaoDispositivo): 
    try:
        nova_linha = pd.DataFrame({
            'NomeDispositivo': ['Não possui'],  # Não usado para periféricos
            'ProcessadorUsado': ['Não possui'],  # Não usado para periféricos
            'MemoriaTotal': ['Não possui'],  # Não usado para periféricos
            'ArmazenamentoInterno': ['Não possui'],  # Não usado para periféricos
            'ModeloDispositivo': [ModeloDispositivo],
            'SerialDispositivo': [SerialDispositivo],
            'TipoDispositivo': [TipoDispositivo],
            'ObservacaoDispositivo': [ObservacaoDispositivo if ObservacaoDispositivo else 'Não possui']
        })
        
        df = pd.read_excel(CAMINHO_ESTOQUE)
        df = pd.concat([df, nova_linha], ignore_index=True)
        df.to_excel(CAMINHO_ESTOQUE, index=False)
        return "Periférico adicionado ao estoque."
    except Exception as e:
        return f"Erro ao adicionar periférico à planilha de estoque: {e}"

def excluir_item(serial):
    # Use o caminho definido para carregar a planilha
    df = pd.read_excel(CAMINHO_ESTOQUE)

    # Verificar se o serial existe na planilha
    if serial in df['SerialDispositivo'].values:
        # Excluir a linha correspondente ao serial
        df = df[df['SerialDispositivo'] != serial]

        # Salvar a planilha atualizada
        df.to_excel(CAMINHO_ESTOQUE, index=False)

        return True
    else:
        return False

def excluir_por_tipo(tipo):
    df = pd.read_excel(CAMINHO_ESTOQUE)

    # Encontrar o primeiro dispositivo do tipo correspondente
    linha_para_excluir = df[df['TipoDispositivo'].str.contains(tipo, case=False, na=False)].index

    if not linha_para_excluir.empty:
        # Excluir a primeira linha encontrada
        df.drop(linha_para_excluir[0], inplace=True)

        # Salvar a planilha atualizada
        df.to_excel(CAMINHO_ESTOQUE, index=False)

        return True, f'Um {tipo} excluído com sucesso'
    else:
        return False, f'Tipo {tipo} não encontrado no estoque'

def contar_itens_por_tipo(tipo):
    print(f"Contando itens do tipo: {tipo}")  # Log para verificar qual tipo está sendo contado
    df = pd.read_excel(CAMINHO_ESTOQUE)

    # Verifica a quantidade de itens do mesmo tipo
    itens_do_tipo = df[df['TipoDispositivo'].str.contains(tipo, case=False, na=False)]
    quantidade = len(itens_do_tipo)
    print(f"Quantidade de itens do tipo {tipo}: {quantidade}")  # Log da quantidade encontrada
    return quantidade

# Função para adicionar dados à planilha de cotacao
def adicionar_a_cotacao(equipamento, quantidade, link, data, tipo):
    try:
        # Carrega a planilha existente
        df = pd.read_excel(CAMINHO_COTACAO)
        
        # Cria uma nova linha com os dados recebidos como um DataFrame
        nova_linha = pd.DataFrame({'Equipamento': [equipamento], 'Quantidade': [quantidade], 'Link': [link], 'Data': [data], 'Tipo': [tipo]})
        
        # Concatena a nova linha ao DataFrame existente
        df = pd.concat([df, nova_linha], ignore_index=True)
        
        # Salva as alterações de volta no arquivo Excel
        df.to_excel(CAMINHO_COTACAO, index=False)
        return True, "Dados salvos com sucesso!"  # Retorna uma mensagem de sucesso
    except Exception as e:
        return False, str(e)  # Retorna a mensagem de erro

# Função para adicionar dados à planilha de descartes
def adicionar_ao_descarte(equipamento, serial, tipo, data, motivo, contato):
    try:
        # Carrega a planilha existente
        df = pd.read_excel(CAMINHO_DESCARTE)
        
        # Cria uma nova linha com os dados recebidos como um DataFrame
        nova_linha = pd.DataFrame({'Equipamento': [equipamento], 'Serial': [serial], 'Tipo':[tipo], 'Data':[data],"Motivo":[motivo],"Contato":[contato]})
        
        # Concatena a nova linha ao DataFrame existente
        df = pd.concat([df, nova_linha], ignore_index=True)
        
        # Salva as alterações de volta no arquivo Excel
        df.to_excel(CAMINHO_DESCARTE, index=False)
        return True, "Dados salvos com sucesso!"  # Retorna uma mensagem de sucesso
    except Exception as e:
        return False, str(e)  # Retorna a mensagem de erro

#COMEÇO BACKEND CONTROLE DE EQUIPAMENTOS
@app.route('/adicionar', methods=['POST'])
def adicionar_item():
    try:
        data = request.json
        serial = data.get('serial')  # Para dispositivos e periféricos
        nova_observacao = data.get('observacao')  # Nova observação vinda do front-end
        tipo_dispositivo = data.get('tipoDispositivo')  # Tipo do dispositivo vindo do front-end
        modelo = data.get('modelo')  # Somente para periféricos

        # Verificar se o serial já está no estoque
        df_estoque = pd.read_excel(CAMINHO_ESTOQUE)
        if serial in df_estoque['SerialDispositivo'].values:
            return jsonify({'erro': 'Serial já está no estoque, não pode ser adicionado novamente.'})

        # Verificar se é periférico ou dispositivo
        if modelo:
            # Trata como periférico
            resultado = adicDadosPeriferico(modelo, serial, tipo_dispositivo, nova_observacao)
            return jsonify({'mensagem': resultado})

        else:
            # Trata como dispositivo (notebook ou desktop)
            encontrado, NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo = consultDados(serial)
            
            if encontrado:
                # Substitui a observação obtida pela nova observação fornecida, se houver
                ObservacaoDispositivo = nova_observacao if nova_observacao else ObservacaoDispositivo
                resultado = adicDados(NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo, tipo_dispositivo)
                return jsonify({'mensagem': resultado})
            else:
                return jsonify({'erro': 'Serial não encontrado na planilha de consulta.'})
    except Exception as e:
        return jsonify({'erro': f'Ocorreu um erro: {str(e)}'}), 500

@app.route('/consulta', methods=['POST'])
def consulta():
    data = request.json
    serial = verificarDispositivoOuPeriferico(data.get('mensagem'))
    if serial:
        encontrado, NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo = consultDados(serial)
        if encontrado:
            return jsonify({
                'NomeDispositivo': NomeDispositivo,
                'ModeloDispositivo': ModeloDispositivo,
                'SerialDispositivo': SerialDispositivo,
                'ProcessadorUsado': ProcessadorUsado,
                'MemoriaTotal': MemoriaTotal,
                'ArmazenamentoInterno': ArmazenamentoInterno,
                'ObservacaoDispositivo': ObservacaoDispositivo
            })
        else:
            return jsonify({"erro": "Serial não encontrado na planilha de consulta."})
    return jsonify({"erro": "Serial não encontrado na mensagem."})

@app.route('/excluir', methods=['POST'])
def excluir():
    data = request.json
    mensagem = data.get('mensagem')

    if not mensagem:
        return jsonify({'status': 'error', 'message': 'Mensagem não encontrada'}), 400

    tipo_ou_serial, valor = verificarDispositivoOuPeriferico(mensagem)
    if not valor:
        return jsonify({'status': 'error', 'message': 'Nenhum serial ou tipo de dispositivo encontrado na mensagem'}), 400

    if tipo_ou_serial == 'dispositivo':
        # Exclusão por serial
        if excluir_item(valor):
            quantidade_restante = contar_itens_por_tipo(valor)  # Função para contar os itens restantes do mesmo tipo
            
            if quantidade_restante < 6:
                return jsonify({'status': 'success', 'message': f'Equipamento com serial {valor} excluído com sucesso', 'aviso': f'Existem apenas {quantidade_restante} itens restantes. Deseja adicionar à cotação?'})
            return jsonify({'status': 'success', 'message': f'Equipamento com serial {valor} excluído com sucesso'})
        else:
            return jsonify({'status': 'error', 'message': 'Serial não encontrado no estoque'}), 404
    elif tipo_ou_serial == 'tipo':
        # Exclusão por tipo de dispositivo
        sucesso, mensagem = excluir_por_tipo(valor)
        if sucesso:
            quantidade_restante = contar_itens_por_tipo(valor)

            if quantidade_restante < 6:
                return jsonify({'status': 'success', 'message': mensagem, 'aviso': f'Existem apenas {quantidade_restante} {valor}s restantes. Deseja adicionar à cotação?'})
            return jsonify({'status': 'success', 'message': mensagem})
        else:
            return jsonify({'status': 'error', 'message': mensagem}), 404

@app.route('/buscar_serial', methods=['POST'])
def buscar_por_serial():
    try:
        data = request.json
        serial = data.get('serial')
        
        # Carregar a planilha de estoque
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Verificar se o serial existe na planilha
        resultado = df[df['SerialDispositivo'] == serial]
        
        if not resultado.empty:
            # Converte a linha encontrada para dicionário
            dispositivo = resultado.to_dict(orient='records')[0]
            return jsonify({'status': 'success', 'dispositivo': dispositivo}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Serial não encontrado no estoque.'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Erro ao buscar o serial: {str(e)}'}), 500
#FIM BACKEND CONTROLE DE EQUIPAMENTOS


#COMEÇO DASHBOARD FILTOS DE TODOS
@app.route('/get_device_info', methods=['GET'])
def get_device_info():
    # Carregue os dados da sua planilha Excel
    df = pd.read_excel('../backend/data/Estoque atual.xlsx')
    
    # Selecione as colunas que deseja retornar
    device_info = df[['ModeloDispositivo', 'ProcessadorUsado', 'MemoriaTotal', 'ArmazenamentoInterno', 'ObservacaoDispositivo', 'TipoDispositivo']].to_dict(orient='records')
    
    return jsonify(device_info)

@app.route('/contar_linhas_preenchidas', methods=['GET'])
def contar_linhas_preenchidas():
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Contar todas as linhas que contêm pelo menos uma célula não vazia
        linhas_preenchidas = df.dropna(how='all').shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_preenchidas': linhas_preenchidas})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas preenchidas: {e}'}), 500

@app.route('/contar_linhas_com_observacao', methods=['GET'])
def contar_linhas_com_observacao():
    
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Filtrar as linhas onde 'ObservacaoDispositivo' não é NaN e não contém 'Não possui'
        filtro = df['ObservacaoDispositivo'].notna() & (df['ObservacaoDispositivo'] != 'Não possui')
        linhas_com_observacao = df[filtro].shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_com_observacao': linhas_com_observacao})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas com observação: {e}'}), 500

@app.route('/exportar_planilha_estoque', methods=['GET'])
def exportar_planilha_estoque():
    try:
        # Verificar se o arquivo existe
        if os.path.exists(CAMINHO_ESTOQUE):
            # Enviar o arquivo de estoque para download
            return send_file(CAMINHO_ESTOQUE, as_attachment=True)
        else:
            return jsonify({'message': 'Planilha de estoque não encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao exportar planilha de estoque: {e}'}), 500

#FINAL DASHBOARD FILTROS DE TODOS


#COMEÇO DASHBOARD FILTROS DOS DESKTOPS
@app.route('/contar_linhas_desktops', methods=['GET'])
def contar_linhas_desktops():
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Filtrar as linhas onde 'TipoDispositivo' é igual a 'Desktop'
        df_desktops = df[df['TipoDispositivo'] == 'Desktop']
        
        # Contar as linhas filtradas
        linhas_desktops = df_desktops.shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_desktops': linhas_desktops})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas de desktops: {e}'}), 500

@app.route('/contar_linhas_com_observacao_desktop', methods=['GET'])
def contar_linhas_com_observacao_desktop():
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Filtrar as linhas onde 'TipoDispositivo' é igual a 'Desktop', 'Observacao' não está vazia e não é 'Não possui'
        df_filtrado = df[
            (df['TipoDispositivo'] == 'Desktop') &
            (df['ObservacaoDispositivo'].notna()) &
            (df['ObservacaoDispositivo'] != 'Não possui')
        ]
        
        # Contar as linhas filtradas
        linhas_com_observacao_desktop = df_filtrado.shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_com_observacao_desktop': linhas_com_observacao_desktop})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas com observação e Desktop: {e}'}), 500
#FINAL DASHBOARD FILTROS DOS DESKTOPS    

#COMEÇO DASHBOARD FILTROS DOS NOTEBOOKS
@app.route('/contar_linhas_notebooks', methods=['GET'])
def contar_linhas_notebooks():
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Filtrar as linhas onde 'TipoDispositivo' é igual a 'Notebook'
        df_desktops = df[df['TipoDispositivo'] == 'Notebook']
        
        # Contar as linhas filtradas
        linhas_notebooks = df_desktops.shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_notebooks': linhas_notebooks})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas de notebooks: {e}'}), 500

@app.route('/contar_linhas_com_observacao_notebook', methods=['GET'])
def contar_linhas_com_observacao_notebook():
    try:
        # Carregar o DataFrame da planilha Excel
        df = pd.read_excel(CAMINHO_ESTOQUE)
        
        # Filtrar as linhas onde 'TipoDispositivo' é igual a 'Notebook', 'Observacao' não está vazia e não é 'Não possui'
        df_filtrado = df[
            (df['TipoDispositivo'] == 'Notebook') &
            (df['ObservacaoDispositivo'].notna()) &
            (df['ObservacaoDispositivo'] != 'Não possui')
        ]
        
        # Contar as linhas filtradas
        linhas_com_observacao_notebook = df_filtrado.shape[0]
        
        # Retornar o resultado como JSON
        return jsonify({'linhas_com_observacao_notebook': linhas_com_observacao_notebook})
    except Exception as e:
        return jsonify({'error': f'Erro ao contar as linhas com observação e notebooks: {e}'}), 500
#FINAL DASHBOARD FILTROS DOS NOTEBOOKS  

#COMEÇO VISUALIZAÇÃO EM PLANILHA
@app.route('/visualizar_estoque', methods=['GET'])
def visualizar_estoque():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON

@app.route('/visualizar_estoque_desktop', methods=['GET'])
def visualizar_estoque_desktop():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON

@app.route('/visualizar_estoque_notebook', methods=['GET'])
def visualizar_estoque_notebook():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON
#FINAL VISUALIZAÇÃO EM PLANILHA

#CONTROLE REPOSIÇÃO
@app.route('/submit', methods=['POST'])
def submit():
    try:
        data = request.json
        item = data.get('equipamento')
        quantidade = data.get('quantidade')
        link = data.get('link')
        data_item = data.get('data')  # Renomeie para 'data_item' para evitar conflito com o módulo 'data'
        tipo = data.get('tipo')
        
        # Chama a função para adicionar o item à cotação
        sucesso, mensagem = adicionar_a_cotacao(item, quantidade, link, data_item, tipo)
        
        if sucesso:
            return jsonify({"message": "Dados enviados com sucesso!"}), 200
        else:
            return jsonify({"message": f"Erro ao salvar dados: {mensagem}"}), 500
    except Exception as e:
        return jsonify({"message": f"Ocorreu um erro: {str(e)}"}), 500
    
@app.route('/contar_tipos', methods=['GET'])
def contar_tipos():
    try:
        # Carrega a planilha
        df = pd.read_excel(CAMINHO_COTACAO)

        # Conta quantos de cada tipo de equipamento existem
        contagem = df['Tipo'].value_counts().to_dict()

        # Retorna a contagem de cada tipo
        return jsonify({
            'maquinas': contagem.get('maquina', 0),
            'perifericos': contagem.get('periferico', 0),
            'cabos': contagem.get('cabo', 0),
            'pecas': contagem.get('peca', 0),
            'outros': contagem.get('outros', 0)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/obter_cotacoes', methods=['GET'])
def obter_cotacoes():
    try:
        # Carrega a planilha com as cotações
        df = pd.read_excel(CAMINHO_COTACAO)

        # Converte o DataFrame para uma lista de dicionários
        cotacoes = df.to_dict(orient='records')

        # Retorna os dados em formato JSON
        return jsonify(cotacoes), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao obter cotações: {str(e)}"}), 500

@app.route('/excluir_cotacao', methods=['POST'])
def excluir_cotacao():
    try:
        dados = request.get_json()
        equipamento = dados.get('equipamento')

        # Carrega a planilha
        df = pd.read_excel(CAMINHO_COTACAO)

        # Filtra as linhas que não correspondem ao equipamento a ser excluído
        df_filtrado = df[df['Equipamento'] != equipamento]

        # Salva as alterações de volta na planilha
        df_filtrado.to_excel(CAMINHO_COTACAO, index=False)

        return jsonify({"message": "Item excluído com sucesso!"}), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao excluir o item: {str(e)}"}), 500

@app.route('/exportar_planilha', methods=['GET'])
def exportar_planilha():
    try:
        # Verificar se o arquivo existe
        if os.path.exists(CAMINHO_COTACAO):
            # Enviar o arquivo para download
            return send_file(CAMINHO_COTACAO, as_attachment=True)
        else:
            return jsonify({'message': 'Planilha não encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao exportar planilha: {e}'}), 500
    try:
        # Verificar se o arquivo existe
        if os.path.exists(CAMINHO_DESCARTE):
            # Enviar o arquivo para download
            return send_file(CAMINHO_DESCARTE, as_attachment=True)
        else:
            return jsonify({'message': 'Planilha não encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao exportar planilha: {e}'}), 500

# CONTROLE DESCARTE
@app.route('/submit_descarte', methods=['POST'])
def submit_descarte():
    try:
        data = request.json
        equipamento = data.get('equipamento')
        serial = data.get('serial')
        tipo = data.get('tipo')
        data_item = data.get('data')  # Renomeado para 'data_item' para evitar conflito com o módulo 'data'
        motivo = data.get('motivo')
        contato = data.get('contato')
        
        # Adiciona os dados à planilha de Descarte
        sucesso, mensagem = adicionar_ao_descarte(equipamento, serial, tipo, data_item, motivo, contato)
        
        if sucesso:
            return jsonify({"message": "Dados de descarte enviados com sucesso!"}), 200
        else:
            return jsonify({"message": f"Erro ao salvar dados: {mensagem}"}), 500
    except Exception as e:
        return jsonify({"message": f"Ocorreu um erro: {str(e)}"}), 500

@app.route('/contar_tipos_descarte', methods=['GET'])
def contar_tipos_descarte():
    try:
        # Carrega a planilha de Descarte
        df = pd.read_excel(CAMINHO_DESCARTE)

        # Conta quantos de cada tipo de equipamento estão na planilha de Descarte
        contagem = df['Tipo'].value_counts().to_dict()

        # Retorna a contagem de cada tipo
        return jsonify({
            'maquinas': contagem.get('maquina', 0),
            'perifericos': contagem.get('periferico', 0),
            'cabos': contagem.get('cabo', 0),
            'pecas': contagem.get('peca', 0),
            'outros': contagem.get('outros', 0)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/obter_descartes', methods=['GET'])
def obter_descartes():
    try:
        # Carrega a planilha com os descartes
        df = pd.read_excel(CAMINHO_DESCARTE)

        # Converte o DataFrame para uma lista de dicionários
        descartes = df.to_dict(orient='records')

        # Retorna os dados em formato JSON
        return jsonify(descartes), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao obter descartes: {str(e)}"}), 500

@app.route('/excluir_descarte', methods=['POST'])
def excluir_descarte():
    try:
        dados = request.get_json()
        equipamento = dados.get('equipamento')

        # Carrega a planilha de Descarte
        df = pd.read_excel(CAMINHO_DESCARTE)

        # Filtra as linhas que não correspondem ao equipamento a ser excluído
        df_filtrado = df[df['Equipamento'] != equipamento]

        # Salva as alterações de volta na planilha
        df_filtrado.to_excel(CAMINHO_DESCARTE, index=False)

        return jsonify({"message": "Item de descarte excluído com sucesso!"}), 200
    except Exception as e:
        return jsonify({"message": f"Erro ao excluir o item de descarte: {str(e)}"}), 500

@app.route('/exportar_planilha_descarte', methods=['GET'])
def exportar_planilha_descarte():
    try:
        # Verificar se o arquivo existe
        if os.path.exists(CAMINHO_DESCARTE):
            # Enviar o arquivo de descarte para download
            return send_file(CAMINHO_DESCARTE, as_attachment=True)
        else:
            return jsonify({'message': 'Planilha de descarte não encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Erro ao exportar planilha de descarte: {e}'}), 500


if __name__ == '__main__':
    app.run(debug=True)