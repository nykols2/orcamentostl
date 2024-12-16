from flask import Flask, request, jsonify, send_from_directory
from stl import mesh
import os

app = Flask(__name__, static_url_path='/static')

# Rota para servir o HTML
@app.route('/')
def serve_html():
    return send_from_directory('.', 'index.html')

# Diretório local para salvar os arquivos enviados
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Garante que a pasta existe

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file.filename.endswith('.stl'):
            return jsonify({'error': ('Tipo de arquivo inválido. O site aceita apenas modelos no formato .stl. ''Seu projeto está no modelo .obj, recomendamos utilizar um conversor online. ''<a href="https://anyconv.com/pt/conversor-de-obj-para-stl/" target="_blank">Clique aqui</a> para acessar uma ferramenta de conversão.'
        )
    }), 400

        # Salvar o arquivo na pasta local
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Processar o arquivo STL
        stl_mesh = mesh.Mesh.from_file(file_path)

        # Obter o valor de escala
        scale = float(request.form.get('scale', 100)) / 100.0  # Porcentagem convertida para escala decimal

        # Aplicar a escala nos vértices
        stl_mesh.x *= scale
        stl_mesh.y *= scale
        stl_mesh.z *= scale

        dimensions = {
            'x': float(stl_mesh.x.max() - stl_mesh.x.min()),
            'y': float(stl_mesh.y.max() - stl_mesh.y.min()),
            'z': float(stl_mesh.z.max() - stl_mesh.z.min()),
        }
        volume = float(stl_mesh.get_mass_properties()[0])  # Volume em mm³
        volume_cm3 = volume / 1000.0  # Converter para cm³

        # Verificar se o volume é maior que 2000 cm³
        if volume_cm3 > 2000:
            return jsonify({'error': 'O volume do modelo excede 2000 cm³. Reduza a escala e envie novamente.'}), 400

        density = 1.04  # Densidade típica do PLA em g/cm³
        weight_g = volume_cm3 * density

        # Deletar o arquivo após o processamento
        os.remove(file_path)

        return jsonify({
            'dimensions': dimensions,
            'volume_cm3': float(volume_cm3),
            'weight_g': float(weight_g),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)