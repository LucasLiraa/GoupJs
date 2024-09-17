from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import re
app = Flask(__name__)
CORS(app)

# Diretório do frontend
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend'))

# Caminhos para os arquivos de estoque
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CAMINHO_CONSULTA = os.path.join(BASE_DIR, 'data', 'Relatório de Dispositivos 25-07-24.xlsx')
CAMINHO_ESTOQUE = os.path.join(BASE_DIR, 'data', 'Estoque atual.xlsx')


@app.route('/buscar_serial', methods=['GET'])
def buscar_serial():
    serial = request.args.get('serial')
    df = pd.read_excel(CAMINHO_ESTOQUE)
    dispositivo = df[df['SerialDispositivo'] == serial][['SerialDispositivo', 'NomeDispositivo', 'ModeloDispositivo',
                                                         'ProcessadorUsado','MemoriaTotal','ArmazenamentoInterno',
                                                         'ObservacaoDispositivo','TipoDispositivo']]
    if not dispositivo.empty:
        info = dispositivo.to_dict(orient='records')[0]
        return jsonify(info)
    else:
        return jsonify({'message': 'Serial não encontrado'})

#COMEÇO BACKEND CONTROLE DE EQUIPAMENTOS
@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(FRONTEND_DIR, path)

def verificar_serial_no_estoque(serial):
    try:
        df_estoque = pd.read_excel(CAMINHO_ESTOQUE)
        if 'SerialDispositivo' not in df_estoque.columns:
            raise Exception("Coluna 'SerialDispositivo' não encontrada.")
        return serial in df_estoque['SerialDispositivo'].values
    except Exception as e:
        print(f"Erro ao verificar serial: {e}")
        return False  # Retorne False caso ocorra um erro

def verificSerial(mensagem):
    padrao = r'\b[A-Z0-9]{6,}\b'
    match = re.search(padrao, mensagem)
    if match:
        return match.group()
    else:
        return None

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
            'NomeDispositivo': [NomeDispositivo],
            'ModeloDispositivo': [ModeloDispositivo if ModeloDispositivo else ''],  # Se vazio, deixe em branco
            'SerialDispositivo': [SerialDispositivo],
            'ProcessadorUsado': [ProcessadorUsado if ProcessadorUsado else ''],  # Se vazio, deixe em branco
            'MemoriaTotal': [MemoriaTotal if MemoriaTotal else ''],  # Se vazio, deixe em branco
            'ArmazenamentoInterno': [ArmazenamentoInterno if ArmazenamentoInterno else ''],  # Se vazio, deixe em branco
            'ObservacaoDispositivo': [ObservacaoDispositivo],
            'TipoDispositivo': [TipoDispositivo]  # Nenhuma palavra-chave é adicionada aqui
        })
        
        df = pd.read_excel(CAMINHO_ESTOQUE)
        df = pd.concat([df, nova_linha], ignore_index=True)
        df.to_excel(CAMINHO_ESTOQUE, index=False)
        return "Equipamento adicionado ao estoque."
    except Exception as e:
        return f"Erro ao adicionar nova linha à planilha de estoque: {e}"
    
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

@app.route('/verificar_serial')
def verificar_serial():
    serial = request.args.get('serial')
    try:
        # Verificar se o serial existe no estoque
        existe = verificar_serial_no_estoque(serial)
        return jsonify({'existe': existe})
    except Exception as e:
        # Captura o erro e retorna um JSON com a mensagem de erro
        return jsonify({'erro': str(e)}), 500

@app.route('/adicionar', methods=['POST'])
def adicionar_item():
    data = request.json
    serial = data.get('serial')
    nova_observacao = data.get('observacao')
    tipo_dispositivo = data.get('tipoDispositivo')

    # Verifica se há palavras-chave para adicionar manualmente
    palavras_chave = ["Monitor", "Teclado", "Mouse", "Adaptador", "DisplayPort"]
    adicionar_manual = any(palavra in tipo_dispositivo for palavra in palavras_chave)

    if adicionar_manual:
        # Adicionar manualmente sem consultar a planilha
        NomeDispositivo = tipo_dispositivo
        ModeloDispositivo = "Manual"
        ProcessadorUsado = "N/A"
        MemoriaTotal = "N/A"
        ArmazenamentoInterno = "N/A"
        ObservacaoDispositivo = nova_observacao if nova_observacao else "Adicionado manualmente"
        
        # Adiciona diretamente ao estoque
        resultado = adicDados(NomeDispositivo, ModeloDispositivo, serial, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo, tipo_dispositivo)
        return jsonify({'mensagem': resultado})
    else:
        # Se não houver palavras-chave, faz a consulta padrão
        encontrado, NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo = consultDados(serial)
        
        if encontrado:
            # Substitui a observação obtida pela nova observação fornecida
            ObservacaoDispositivo = nova_observacao if nova_observacao else ObservacaoDispositivo
            resultado = adicDados(NomeDispositivo, ModeloDispositivo, SerialDispositivo, ProcessadorUsado, MemoriaTotal, ArmazenamentoInterno, ObservacaoDispositivo, tipo_dispositivo)
            return jsonify({'mensagem': resultado})
        else:
            return jsonify({'erro': 'Serial não encontrado na planilha de consulta.'})


@app.route('/consulta', methods=['POST'])
def consulta():
    data = request.json
    serial = verificSerial(data.get('mensagem'))
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

    serial = verificSerial(mensagem)
    
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

@app.route('/visualizar_estoque', methods=['GET'])
def visualizar_estoque():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.drop(columns=['EquipamentoKit', 'IdentificaçãoKit', 'ImagensDash'])  # Remove a coluna indesejada
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON

@app.route('/visualizar_estoque_desktop', methods=['GET'])
def visualizar_estoque_desktop():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.drop(columns=['EquipamentoKit', 'IdentificaçãoKit', 'ImagensDash'])  # Remove a coluna indesejada
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON

@app.route('/visualizar_estoque_notebook', methods=['GET'])
def visualizar_estoque_notebook():
    df = pd.read_excel(CAMINHO_ESTOQUE)  # Carrega o arquivo Excel
    df = df.drop(columns=['EquipamentoKit', 'IdentificaçãoKit', 'ImagensDash'])  # Remove a coluna indesejada
    df = df.fillna('')  # Substitui valores NaN por string vazia
    data = df.to_dict(orient='records')  # Converte os dados para um dicionário (JSON)
    return jsonify(data)  # Retorna os dados como JSON

if __name__ == '__main__':
    app.run(debug=True)