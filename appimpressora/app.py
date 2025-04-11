import time
import requests
import win32print
import win32ui

API_URL = "https://seudominio.com/api/pedidos"
ULTIMO_ID = 0  # para controlar se o pedido já foi impresso

def imprimir_texto(texto):
    printer_name = win32print.GetDefaultPrinter()
    hprinter = win32print.OpenPrinter(printer_name)
    printer_info = win32print.GetPrinter(hprinter, 2)
    
    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(printer_name)
    hdc.StartDoc("Pedido do Cardápio Digital")
    hdc.StartPage()
    hdc.TextOut(100, 100, texto)
    hdc.EndPage()
    hdc.EndDoc()
    hdc.DeleteDC()

def buscar_pedidos():
    global ULTIMO_ID
    try:
        response = requests.get(API_URL)
        pedidos = response.json()

        for pedido in pedidos:
            if pedido["id"] > ULTIMO_ID:
                print(f"🖨️ Novo pedido recebido: {pedido['conteudo']}")
                imprimir_texto(pedido["conteudo"])
                ULTIMO_ID = pedido["id"]

    except Exception as e:
        print(f"Erro ao buscar pedidos: {e}")

# Loop infinito: verifica pedidos a cada 5 segundos
print("🔄 App de Impressão iniciado...")
while True:
    buscar_pedidos()
    time.sleep(5)
