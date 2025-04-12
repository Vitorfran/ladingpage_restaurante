from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

pedidos_db = []
ultimo_id = 0

@app.route('/api/pedidos', methods=['GET'])
def get_pedidos():
    try:
        # Retorna todos os pedidos formatados corretamente
        return jsonify([{
            "id": p["id"],
            "conteudo": f"Pedido #{p['id']} - {p['cliente']} - Total: R$ {float(p['total']):.2f}",
            "cliente": p["cliente"],
            "telefone": p.get("telefone", ""),
            "endereco": p["endereco"],
            "itens": p["itens"],
            "total": p["total"],
            "forma_pagamento": p["forma_pagamento"],
            "troco_para": p.get("troco_para", 0),
            "data": p["data"],
            "status": p.get("status", "Recebido")
        } for p in pedidos_db])
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pedidos', methods=['POST'])
def criar_pedido():
    global ultimo_id
    
    try:
        data = request.get_json()
        
        # Validação dos campos obrigatórios
        required_fields = ['cliente', 'itens', 'total', 'forma_pagamento']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo obrigatório faltando: {field}"}), 400
        
        # Cria o pedido com estrutura completa
        ultimo_id += 1
        novo_pedido = {
            "id": ultimo_id,
            "cliente": data['cliente'],
            "telefone": data.get('telefone', ''),
            "endereco": data.get('endereco', 'Retirada no local'),
            "itens": data['itens'],
            "total": float(data['total']),
            "forma_pagamento": data['forma_pagamento'],
            "troco_para": float(data.get('troco_para', 0)),
            "data": datetime.now().isoformat(),
            "status": "Recebido"
        }
        
        pedidos_db.append(novo_pedido)
        print(f"\n✅ Pedido #{ultimo_id} recebido com sucesso!")
        return jsonify(novo_pedido), 201
        
    except Exception as e:
        print(f"\n❌ Erro ao processar pedido: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)