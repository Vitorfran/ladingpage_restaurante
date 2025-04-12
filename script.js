// Array do carrinho
let cart = [];

// ==============================================
// FUNÇÕES DE CONTROLE DO CARRINHO
// ==============================================

function toggleEnderecoFields() {
  const retiradaCheckbox = document.getElementById('retiradaCheckbox');
  const enderecoFields = document.getElementById('enderecoFields');
  
  if (retiradaCheckbox.checked) {
    enderecoFields.style.display = 'none';
  } else {
    enderecoFields.style.display = 'block';
  }
}

function toggleSecondFlavor(selectElement) {
  const card = selectElement.closest('.card');
  const secondFlavorDiv = card.querySelector('.second-flavor');
  
  if (selectElement.value === '2') {
    secondFlavorDiv.style.display = 'block';
  } else {
    secondFlavorDiv.style.display = 'none';
    card.querySelector('.second-flavor-select').value = '';
  }
}

function addToCart(item, price, tamanho = null, sabores = [], event = null) {
  const cartItem = {
    item: item,
    price: parseFloat(price),
    tamanho: tamanho,
    sabores: sabores
  };
  
  cart.push(cartItem);
  updateCart();
  
  if (event?.target) {
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Adicionado';
    btn.classList.replace('btn-primary', 'btn-success');
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.replace('btn-success', 'btn-primary');
      btn.disabled = false;
    }, 2000);
  }
}

function addPizzaToCart(nomePizza, precoBase, buttonElement) {
  const card = buttonElement.closest('.card');
  const tamanho = card.querySelector('.size-select').value;
  const isDoisSabores = card.querySelector('.flavor-select').value === '2';
  const segundoSabor = isDoisSabores ? card.querySelector('.second-flavor-select').value : null;

  if (isDoisSabores && !segundoSabor) {
    alert('Por favor, selecione o segundo sabor');
    return;
  }

  let precoFinal = parseFloat(precoBase);
  
  if (tamanho === 'M') precoFinal += 5;
  else if (tamanho === 'G') precoFinal += 10;
  
  if (isDoisSabores && segundoSabor) {
    const precos = {
      'Mussarela': 34.90,
      'Calabresa': 34.90,
      'Frango com Catupiry': 39.90,
      'Quatro Queijos': 44.90,
      'Portuguesa': 42.90,
      'Margherita': 38.90
    };
    const precoSegundoSabor = precos[segundoSabor] || precoFinal;
    precoFinal = (precoFinal + precoSegundoSabor) / 2;
  }

  const nomeTamanho = tamanho === 'P' ? 'Pequena' : 
                     tamanho === 'M' ? 'Média' : 'Grande';

  let descricao = `Pizza ${nomePizza}`;
  const sabores = [nomePizza];
  
  if (isDoisSabores) {
    descricao += ` + ${segundoSabor}`;
    sabores.push(segundoSabor);
  }
  
  descricao += ` (${nomeTamanho})`;

  addToCart(descricao, precoFinal, tamanho, sabores, window.event);
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

function updateCart() {
  const list = document.getElementById("cartList");
  const totalElement = document.getElementById("cartTotal");
  const btn = document.getElementById("whatsappBtn");
  let total = 0;

  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = '<li class="list-group-item empty-cart">Seu carrinho está vazio</li>';
    totalElement.textContent = "0.00";
    btn.classList.add("disabled");
    return;
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    
    let descricao = item.item;
    if (item.tamanho) descricao += ` (${getTamanhoName(item.tamanho)})`;
    if (item.sabores?.length > 1) descricao += ` - Sabores: ${item.sabores.join(', ')}`;
    
    li.innerHTML = `
      <span>${descricao} - R$ ${item.price.toFixed(2)}</span>
      <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">
        <i class="bi bi-trash"></i>
      </button>
    `;
    list.appendChild(li);
    total += item.price;
  });

  totalElement.textContent = total.toFixed(2);
  btn.classList.remove("disabled");
}

function getTamanhoName(tamanho) {
  return tamanho === 'P' ? 'Pequena' : 
         tamanho === 'M' ? 'Média' : 'Grande';
}

// ==============================================
// FUNÇÕES DE INTEGRAÇÃO - VERSÃO VERCEL
// ==============================================

async function enviarPedidoParaAPI() {
  const nome = document.getElementById('customerName').value;
  const tel = document.getElementById('customerPhone')?.value || '';
  const endereco = document.getElementById('customerAddress')?.value || '';
  const complemento = document.getElementById('customerComplement')?.value || '';
  const pagamento = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Não informado';
  const troco = document.getElementById('trocoPara')?.value || '';
  const isRetirada = document.getElementById('retiradaCheckbox').checked;

  if (!nome || (!isRetirada && (!tel || !endereco))) {
    throw new Error('Dados do cliente incompletos');
  }

  const itensPedido = cart.map(item => ({
    produto: item.item,
    preco: item.price,
    ...(item.tamanho && { tamanho: item.tamanho }),
    ...(item.sabores?.length > 0 && { sabores: item.sabores })
  }));

  const total = parseFloat(document.getElementById("cartTotal").textContent);

  const pedidoData = {
    cliente: nome,
    telefone: tel,
    endereco: isRetirada ? "Retirada no local" : `${endereco} ${complemento}`.trim(),
    itens: itensPedido,
    total: total,
    forma_pagamento: pagamento,
    ...(pagamento === 'Dinheiro' && troco && { troco_para: parseFloat(troco) }),
    data: new Date().toISOString()
  };

  try {
    const API_URL = "https://ladingpage-restaurante-one.vercel.app/";
    console.log("Enviando pedido para:", API_URL, pedidoData);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Resposta da API:", responseData);
    return responseData;

  } catch (error) {
    console.error('Falha na comunicação com a API:', {
      error: error.message,
      endpoint: API_URL,
      data: pedidoData
    });
    throw error;
  }
}

function montarMensagemWhatsApp() {
  const nome = document.getElementById('customerName').value;
  const tel = document.getElementById('customerPhone')?.value || '';
  const endereco = document.getElementById('customerAddress')?.value || '';
  const complemento = document.getElementById('customerComplement')?.value || '';
  const pagamento = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Não informado';
  const troco = document.getElementById('trocoPara')?.value || '';
  const isRetirada = document.getElementById('retiradaCheckbox').checked;

  let msg = "🍕 *PEDIDO PIZZARIA* 🍕\n\n";
  msg += "*Itens do Pedido:*\n";
  
  cart.forEach((item, index) => {
    msg += `${index + 1}. ${item.item} - R$ ${item.price.toFixed(2)}\n`;
  });

  msg += `\n*Total:* R$ ${parseFloat(document.getElementById("cartTotal").textContent)}\n\n`;
  msg += "*Dados do Cliente:*\n";
  msg += `Nome: ${nome}\n`;
  
  if (!isRetirada) {
    msg += `Telefone: ${tel}\n`;
    msg += `Endereço: ${endereco}\n`;
    if (complemento) msg += `Complemento: ${complemento}\n`;
  }
  
  msg += `\n*Tipo de Entrega:* ${isRetirada ? 'Retirada' : 'Delivery'}\n`;
  msg += `*Pagamento:* ${pagamento}\n`;
  
  if (pagamento === 'Dinheiro' && troco) {
    msg += `Troco para: R$ ${parseFloat(troco).toFixed(2)}\n`;
  }
  
  msg += "\nObrigado pelo pedido!";

  return msg;
}

// ==============================================
// FUNÇÕES DE VALIDAÇÃO
// ==============================================

function validarFormulario() {
  const nome = document.getElementById('customerName').value.trim();
  if (!nome) {
    alert('Por favor, informe seu nome');
    document.getElementById('customerName').focus();
    return false;
  }

  const isRetirada = document.getElementById('retiradaCheckbox').checked;
  if (!isRetirada) {
    const telefone = document.getElementById('customerPhone').value.trim();
    const endereco = document.getElementById('customerAddress').value.trim();
    
    if (!telefone) {
      alert('Por favor, informe seu telefone');
      document.getElementById('customerPhone').focus();
      return false;
    }
    
    if (!endereco) {
      alert('Por favor, informe o endereço de entrega');
      document.getElementById('customerAddress').focus();
      return false;
    }
  }

  return true;
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('retiradaCheckbox').addEventListener('change', toggleEnderecoFields);
  
  document.querySelectorAll('input[name="paymentMethod"]').forEach(method => {
    method.addEventListener('change', function() {
      document.getElementById('trocoField').style.display = 
        this.value === 'Dinheiro' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.flavor-select').forEach(select => {
    select.addEventListener('change', function() {
      toggleSecondFlavor(this);
    });
  });

  document.getElementById('whatsappBtn').addEventListener('click', async function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Por favor, adicione itens ao carrinho');
      return;
    }
    
    if (!validarFormulario()) {
      return;
    }
    
    const btn = this;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...';
    btn.disabled = true;
    
    try {
      await enviarPedidoParaAPI();
      const msg = montarMensagemWhatsApp();
      window.location.href = `https://wa.me/558199862307?text=${encodeURIComponent(msg)}`;
    } catch (error) {
      console.error("Erro completo:", error);
      const shouldContinue = confirm(`${error.message}\nDeseja enviar diretamente pelo WhatsApp mesmo assim?`);
      if (shouldContinue) {
        const msg = montarMensagemWhatsApp();
        window.location.href = `https://wa.me/558199862307?text=${encodeURIComponent(msg)}`;
      }
    } finally {
      btn.innerHTML = '<i class="bi bi-whatsapp"></i> Enviar pedido';
      btn.disabled = false;
    }
  });

  toggleEnderecoFields();
});