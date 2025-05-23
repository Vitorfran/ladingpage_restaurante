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
  const tamanho = card.querySelector('.size-select')?.value || 'M';
  const flavorSelect = card.querySelector('.flavor-select');
  const isDoisSabores = flavorSelect ? flavorSelect.value === '2' : false;
  const segundoSabor = isDoisSabores ? card.querySelector('.second-flavor-select')?.value : null;

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
// FUNÇÃO PARA MONTAR MENSAGEM DO WHATSAPP
// ==============================================

function montarMensagemWhatsApp() {
  // Dados obrigatórios
  const nome = document.getElementById('customerName').value.trim();
  const isRetirada = document.getElementById('retiradaCheckbox').checked;
  
  // Dados condicionais
  const tel = isRetirada ? '' : document.getElementById('customerPhone').value.trim();
  const endereco = isRetirada ? '' : document.getElementById('customerAddress').value.trim();
  const complemento = isRetirada ? '' : document.getElementById('customerComplement')?.value.trim() || '';
  
  // Dados opcionais
  const observacoes = document.getElementById('customerObservations')?.value.trim() || '';
  const pagamentoElement = document.querySelector('input[name="paymentMethod"]:checked');
  const pagamento = pagamentoElement ? pagamentoElement.value : 'Não informado';
  const troco = pagamento === 'Dinheiro' ? document.getElementById('trocoPara').value.trim() : '';

  // Validações básicas
  if (!nome) {
    alert('Por favor, informe seu nome');
    return false;
  }

  if (!isRetirada) {
    if (!tel) {
      alert('Por favor, informe seu telefone');
      return false;
    }
    if (!endereco) {
      alert('Por favor, informe o endereço de entrega');
      return false;
    }
  }

  // Montagem da mensagem
  let msg = "🍕 *PEDIDO PIZZARIA* 🍕\n\n";
  msg += "*Itens do Pedido:*\n";
  
  cart.forEach((item) => {
    msg += `➡ ${item.item} - R$ ${item.price.toFixed(2)}\n`;
  });

  msg += `\n*Total: R$ ${parseFloat(document.getElementById("cartTotal").textContent).toFixed(2)}*\n\n`;

  msg += "*Dados do Cliente:*\n";
  msg += `👤 Nome: ${nome}\n`;
  
  if (!isRetirada) {
    msg += `📞 Telefone: ${tel}\n`;
    msg += `🏠 Endereço: ${endereco}\n`;
    if (complemento) msg += `🔹 Complemento: ${complemento}\n`;
  }

  if (observacoes) {
    msg += `📝 Observações: ${observacoes}\n`;
  }

  msg += `\n*Entrega:* ${isRetirada ? '🛵 RETIRADA NO LOCAL' : '🚚 DELIVERY'}\n`;

  // Forma de pagamento (corrigido para PIX maiúsculo)
  switch (pagamento) {
    case 'Dinheiro':
      msg += `*Pagamento:* 💵 Dinheiro\n`;
      if (troco) msg += `💰 Troco para: R$ ${parseFloat(troco).toFixed(2)}\n`;
      break;
    case 'Cartão':
      msg += `*Pagamento:* 💳 Cartão\n`;
      break;
    case 'PIX':
      msg += `*Pagamento:* 📲 Pix\n`;
      break;
    default:
      msg += `*Pagamento:* ❓ Não informado\n`;
  }

  msg += "\nAgradecemos pela preferência! 🍕";

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
  // Configura eventos
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

  // Botão WhatsApp
  document.getElementById('whatsappBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Por favor, adicione itens ao carrinho');
      return;
    }
    
    if (!validarFormulario()) {
      return;
    }
    
    const msg = montarMensagemWhatsApp();
    window.location.href = `https://wa.me/5581996025631?text=${encodeURIComponent(msg)}`;
  });

  // Promoção do dia
  const cardPromocao = document.getElementById('cardPromocaoPizza');
  const diaAtualPromo = document.getElementById('diaAtualPromo');
  
  if (cardPromocao && diaAtualPromo) {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    diaAtualPromo.textContent = dias[diaSemana];
    
    if(diaSemana >= 1 && diaSemana <= 5) {
      cardPromocao.style.display = 'block';
      if(diaSemana === 3) {
        cardPromocao.querySelector('.card').classList.add('shadow-lg');
        cardPromocao.querySelector('h5').innerHTML = 'Pizza Promo <span class="badge bg-warning text-dark ms-1">Quarta Maluca!</span>';
      }
    }
  }

  // Inicializa campos
  toggleEnderecoFields();
});