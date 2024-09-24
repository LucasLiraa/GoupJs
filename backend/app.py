from flask import Flask, send_from_directory, request, jsonify
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

#COMEÇO BACKEND CONTROLE DE EQUIPAMENTOS
@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

def verificarDispositivoOuPeriferico(mensagem):
    # Verificar se é um serial (Desktop ou Notebook)
    padrao_serial = r'\b[A-Z0-9]{6,}\b'
    match_serial = re.search(padrao_serial, mensagem)
    
    # Verificar se é um periférico (Monitor, Teclado, Mouse)
    padrao_periferico = r'\b(monitor|teclado|mouse)\b'
    match_periferico = re.search(padrao_periferico, mensagem, re.IGNORECASE)
    
    if match_serial:
        return 'dispositivo', match_serial.group()
    elif match_periferico:
        return 'periferico', match_periferico.group()
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

    serial = verificarDispositivoOuPeriferico(mensagem)
    
    if not serial:
        return jsonify({'status': 'error', 'message': 'Serial não encontrado na mensagem'}), 400
    
    # Chama a função de exclusão e verifica o resultado
    if excluir_item(serial):
        return jsonify({'status': 'success', 'message': f'Equipamento com serial {serial} excluído com sucesso'})
    else:
        return jsonify({'status': 'error', 'message': 'Serial não encontrado no estoque'}), 404 
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
#FINAL DASHBOARD FILTROS DOS DESKTOPS

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

if __name__ == '__main__':
    app.run(debug=True)