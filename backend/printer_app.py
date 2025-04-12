import time
import requests
import os
from datetime import datetime
from fpdf import FPDF
import win32print
import win32ui
import glob
import time

API_URL = "http://127.0.0.1:5000/api/pedidos"
ULTIMO_ID = 0
PASTA_PEDIDOS = "pedidos_impressos"

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, '🍕 PIZZARIA DELÍCIA 🍕', 0, 1, 'C')
        self.set_font('Arial', '', 10)
        self.cell(0, 10, datetime.now().strftime('%d/%m/%Y %H:%M'), 0, 1, 'C')
        self.ln(5)

def criar_pasta_pedidos():
    if not os.path.exists(PASTA_PEDIDOS):
        os.makedirs(PASTA_PEDIDOS)
        print(f"📁 Pasta criada: {os.path.abspath(PASTA_PEDIDOS)}")

def verificar_impressora():
    try:
        printer_name = win32print.GetDefaultPrinter()
        if printer_name:
            print(f"📠 Impressora detectada: {printer_name}")
            return True
        return False
    except:
        print("⚠️ Nenhuma impressora configurada")
        return False

def salvar_pdf(pedido, conteudo):
    try:
        criar_pasta_pedidos()
        pdf = PDF()
        pdf.add_page()
        pdf.set_font("Arial", size=10)
        
        # Cabeçalho
        pdf.cell(0, 6, '=========================', 0, 1)
        pdf.cell(0, 6, 'PIZZARIA DELÍCIA', 0, 1, 'C')
        pdf.cell(0, 6, datetime.now().strftime('%d/%m/%Y %H:%M'), 0, 1, 'C')
        pdf.cell(0, 6, '=========================', 0, 1)
        
        # Dados do pedido
        pdf.cell(0, 6, f"Cliente: {pedido['cliente']}", 0, 1)
        pdf.cell(0, 6, f"Telefone: {pedido.get('telefone', 'Não informado')}", 0, 1)
        pdf.cell(0, 6, f"Tipo: {'RETIRADA' if pedido['endereco'] == 'Retirada no local' else 'ENTREGA'}", 0, 1)
        pdf.cell(0, 6, '-------------------------', 0, 1)
        pdf.cell(0, 6, 'ITENS:', 0, 1)
        
        # Itens do pedido
        for item in pedido['itens']:
            pdf.cell(0, 6, f"- {item['produto']} - R$ {item['preco']:.2f}", 0, 1)
            if 'sabores' in item and item['sabores']:
                pdf.cell(0, 6, f"  Sabores: {', '.join(item['sabores'])}", 0, 1)
        
        # Total e pagamento
        pdf.cell(0, 6, '-------------------------', 0, 1)
        pdf.cell(0, 6, f"Total: R$ {pedido['total']:.2f}", 0, 1)
        pdf.cell(0, 6, f"Pagamento: {pedido['forma_pagamento']}", 0, 1)
        if pedido['forma_pagamento'] == 'Dinheiro' and pedido['troco_para'] > 0:
            pdf.cell(0, 6, f"Troco para: R$ {pedido['troco_para']:.2f}", 0, 1)
        
        # Rodapé
        pdf.cell(0, 6, '=========================', 0, 1)
        pdf.cell(0, 6, 'Obrigado pela preferência!', 0, 1, 'C')
        
        # Salvar arquivo
        nome_arquivo = f"pedido_{pedido['id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        caminho_completo = os.path.join(PASTA_PEDIDOS, nome_arquivo)
        pdf.output(caminho_completo)
        
        print(f"✅ PDF salvo em: {os.path.abspath(caminho_completo)}")
        return True
    except Exception as e:
        print(f"❌ Erro ao gerar PDF: {e}")
        return False

def imprimir_pedido(pedido):
    try:
        printer_name = win32print.GetDefaultPrinter()
        if not printer_name:
            print("⚠️ Nenhuma impressora configurada - salvando como PDF")
            return salvar_pdf(pedido, "")

        hprinter = win32print.OpenPrinter(printer_name)
        hdc = win32ui.CreateDC()
        hdc.CreatePrinterDC(printer_name)
        hdc.StartDoc("Pedido Pizzaria")
        hdc.StartPage()

        font = win32ui.CreateFont({
            "name": "Courier New",
            "height": 100,
            "weight": 400,
        })
        hdc.SelectObject(font)

        y_position = 300
        lines = [
            "PIZZARIA DELÍCIA",
            datetime.now().strftime('%d/%m/%Y %H:%M'),
            "=========================",
            f"Cliente: {pedido['cliente']}",
            f"Telefone: {pedido.get('telefone', 'Não informado')}",
            f"Tipo: {'RETIRADA' if pedido['endereco'] == 'Retirada no local' else 'ENTREGA'}",
            "-------------------------",
            "ITENS:"
        ]

        # Adiciona itens
        for item in pedido['itens']:
            lines.append(f"- {item['produto']} - R$ {item['preco']:.2f}")
            if 'sabores' in item and item['sabores']:
                lines.append(f"  Sabores: {', '.join(item['sabores'])}")

        # Adiciona total e pagamento
        lines.extend([
            "-------------------------",
            f"Total: R$ {pedido['total']:.2f}",
            f"Pagamento: {pedido['forma_pagamento']}"
        ])
        
        if pedido['forma_pagamento'] == 'Dinheiro' and pedido['troco_para'] > 0:
            lines.append(f"Troco para: R$ {pedido['troco_para']:.2f}")

        lines.extend([
            "=========================",
            "Obrigado pela preferência!"
        ])

        # Imprime todas as linhas
        for line in lines:
            hdc.TextOut(100, y_position, line)
            y_position += 100

        hdc.EndPage()
        hdc.EndDoc()
        hdc.DeleteDC()
        win32print.ClosePrinter(hprinter)
        
        print("✅ Pedido enviado para impressora")
        return True
    except Exception as e:
        print(f"❌ Falha na impressão: {e}")
        return salvar_pdf(pedido, "")

def buscar_pedidos():
    global ULTIMO_ID
    try:
        print(f"\n{datetime.now().strftime('%H:%M:%S')} - Buscando pedidos...")
        response = requests.get(API_URL, timeout=5)
        
        if response.status_code != 200:
            print(f"⚠️ Erro na API (Status {response.status_code})")
            return

        pedidos = response.json()
        print(f"📦 Pedidos recebidos: {len(pedidos)}")

        if not pedidos:
            print("📭 Nenhum pedido novo encontrado")
            return

        for pedido in pedidos:
            if pedido["id"] > ULTIMO_ID:
                print(f"\n🆕 Pedido #{pedido['id']} - Cliente: {pedido['cliente']}")
                print(f"💰 Total: R$ {pedido['total']:.2f}")
                
                if imprimir_pedido(pedido):
                    ULTIMO_ID = pedido["id"]
                else:
                    print("❌ Falha ao processar pedido")

    except requests.exceptions.RequestException as e:
        print(f"🔌 Erro de conexão: {e}")
    except Exception as e:
        print(f"⚠️ Erro inesperado: {e}")

if __name__ == "__main__":
    print("""
    ================================
     🍕 SISTEMA DE PEDIDOS 🍕
    ================================
    """)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"🔍 Monitorando: {API_URL}")
    
    # Verificar se a API está respondendo
    try:
        test_response = requests.get(API_URL, timeout=3)
        if test_response.status_code == 200:
            print("✅ Conexão com a API estabelecida")
        else:
            print(f"⚠️ API retornou status {test_response.status_code}")
    except:
        print("❌ Não foi possível conectar à API")
    
    print("\n🛑 Pressione Ctrl+C para encerrar\n")
    
    try:
        while True:
            buscar_pedidos()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n👋 Encerrando sistema...")


for arquivo in glob.glob(f"{PASTA_PEDIDOS}/*.pdf"):
    if os.path.getmtime(arquivo) < (time.time() - 30 * 86400):  # 30 dias
        os.remove(arquivo)        