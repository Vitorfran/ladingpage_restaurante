// Array do carrinho
let cart = [];

// Função para mostrar/ocultar campos de endereço
function toggleEnderecoFields() {
  const retiradaCheckbox = document.getElementById('retiradaCheckbox');
  const enderecoFields = document.getElementById('enderecoFields');
  
  if (retiradaCheckbox.checked) {
    enderecoFields.style.display = 'none';
  } else {
    enderecoFields.style.display = 'block';
  }
}

// Função para adicionar itens ao carrinho
function addToCart(item, price, tamanho = null, sabores = [], event = null) {
  const cartItem = {
    item: item,
    price: parseFloat(price),
    tamanho: tamanho,
    sabores: sabores
  };
  
  cart.push(cartItem);
  updateCart();
  updateWhatsAppLink();
  
  // Feedback visual
  if (event && event.target) {
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Adicionado';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('btn-success');
      btn.classList.add('btn-primary');
      btn.disabled = false;
    }, 2000);
  }
}

// Função para adicionar pizzas ao carrinho
function addPizzaToCart(nomePizza, precoBase, buttonElement) {
  const card = buttonElement.closest('.card');
  const tamanho = card.querySelector('.size-select').value;
  const isDoisSabores = card.querySelector('.flavor-select').value === '2';
  const segundoSabor = isDoisSabores ? card.querySelector('.second-flavor-select').value : null;

  // Validação
  if (isDoisSabores && (!segundoSabor || segundoSabor === "")) {
    alert('Por favor, selecione o segundo sabor');
    return;
  }

  // Cálculo do preço
  let precoFinal = parseFloat(precoBase);
  
  // Ajuste por tamanho
  if (tamanho === 'M') precoFinal += 5;
  else if (tamanho === 'G') precoFinal += 10;
  
  // Cálculo para 2 sabores
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

  // Nome do tamanho para exibição
  const nomeTamanho = tamanho === 'P' ? 'Pequena' : 
                     tamanho === 'M' ? 'Média' : 'Grande';

  // Descrição completa
  let descricao = `Pizza ${nomePizza}`;
  const sabores = [nomePizza];
  
  if (isDoisSabores) {
    descricao += ` + ${segundoSabor}`;
    sabores.push(segundoSabor);
  }
  
  descricao += ` (${nomeTamanho})`;

  // Adiciona ao carrinho
  addToCart(descricao, precoFinal, tamanho, sabores, window.event);
}

// Função para remover item do carrinho
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
  updateWhatsAppLink();
}

// Função para limpar o carrinho
function clearCart() {
  cart = [];
  updateCart();
  updateWhatsAppLink();
}

// Função para atualizar a exibição do carrinho
function updateCart() {
  const list = document.getElementById("cartList");
  const totalElement = document.getElementById("cartTotal");
  const btn = document.getElementById("whatsappBtn");
  let total = 0;

  // Limpa a lista
  list.innerHTML = "";

  // Verifica se o carrinho está vazio
  if (cart.length === 0) {
    list.innerHTML = '<li class="list-group-item empty-cart">Seu carrinho está vazio</li>';
    totalElement.textContent = "0.00";
    btn.classList.add("disabled");
    return;
  }

  // Adiciona cada item do carrinho
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

  // Atualiza o total
  totalElement.textContent = total.toFixed(2);
  btn.classList.remove("disabled");
}

// Função auxiliar para nome do tamanho
function getTamanhoName(tamanho) {
  return tamanho === 'P' ? 'Pequena' : 
         tamanho === 'M' ? 'Média' : 'Grande';
}

// Função para validar o formulário
function validarFormulario() {
  const nome = document.getElementById('customerName').value.trim();
  if (!nome) {
    alert('Por favor, informe seu nome');
    return false;
  }

  const isRetirada = document.getElementById('retiradaCheckbox').checked;
  if (!isRetirada) {
    const telefone = document.getElementById('customerPhone').value.trim();
    const endereco = document.getElementById('customerAddress').value.trim();
    
    if (!telefone) {
      alert('Por favor, informe seu telefone');
      return false;
    }
    
    if (!endereco) {
      alert('Por favor, informe o endereço de entrega');
      return false;
    }
  }

  return true;
}
function toggleSecondFlavor(selectElement) {
  const card = selectElement.closest('.card');
  const secondFlavorDiv = card.querySelector('.second-flavor');
  
  if (selectElement.value === '2') {
    secondFlavorDiv.style.display = 'block';
  } else {
    secondFlavorDiv.style.display = 'none';
    // Reseta a seleção do segundo sabor
    card.querySelector('.second-flavor-select').value = '';
  }
}

// Função para adicionar pizza ao carrinho
function addPizzaToCart(nomePizza, precoBase, buttonElement) {
  const card = buttonElement.closest('.card');
  const tamanhoSelect = card.querySelector('.size-select');
  const flavorSelect = card.querySelector('.flavor-select');
  const secondFlavorSelect = card.querySelector('.second-flavor-select');
  
  const tamanho = tamanhoSelect.value;
  const isDoisSabores = flavorSelect.value === '2';
  const segundoSabor = isDoisSabores ? secondFlavorSelect.value : null;

  // Validação do segundo sabor
  if (isDoisSabores && (!segundoSabor || segundoSabor === "")) {
    alert('Por favor, selecione o segundo sabor');
    return;
  }

  // Cálculo do preço
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

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Configura o evento para mostrar/ocultar segundo sabor
  document.querySelectorAll('.flavor-select').forEach(select => {
    select.addEventListener('change', function() {
      toggleSecondFlavor(this);
    });
  });
});

// Função para atualizar o link do WhatsApp
function updateWhatsAppLink() {
  const btn = document.getElementById("whatsappBtn");
  if (cart.length === 0) {
    btn.classList.add('disabled');
    btn.href = "#";
    return;
  }
  
  

  const nome = document.getElementById('customerName').value;
  const tel = document.getElementById('customerPhone')?.value || '';
  const endereco = document.getElementById('customerAddress')?.value || '';
  const complemento = document.getElementById('customerComplement')?.value || '';
  const pagamento = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Não informado';
  const troco = document.getElementById('trocoPara')?.value || '';
  const isRetirada = document.getElementById('retiradaCheckbox').checked;

  let msg = "Olá, gostaria de fazer o seguinte pedido:\n\n";
  cart.forEach(item => {
    msg += `- ${item.item} - R$ ${item.price.toFixed(2)}\n`;
  });

  const total = parseFloat(document.getElementById("cartTotal").textContent);
  msg += `\n\n*Dados do Cliente:*\nNome: ${nome}`;
  
  if (!isRetirada) {
    msg += `\nTelefone: ${tel}\nEndereço: ${endereco}`;
    if (complemento) msg += `\nComplemento: ${complemento}`;
  }
  
  msg += `\n\n*Tipo de Pedido:* ${isRetirada ? 'Retirada no local' : 'Entrega'}`;
  msg += `\n*Pagamento:* ${pagamento}`;
  if (pagamento === 'Dinheiro' && troco) msg += `\nTroco para: R$ ${parseFloat(troco).toFixed(2)}`;
  msg += `\n\n*Total do Pedido:* R$ ${total.toFixed(2)}\n\nObrigado!`;

  btn.href = `https://wa.me/558199862307?text=${encodeURIComponent(msg)}`;
  btn.classList.remove("disabled");
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Configura o evento para mostrar/ocultar campos de endereço
  document.getElementById('retiradaCheckbox').addEventListener('change', toggleEnderecoFields);
  
  // Configura o evento para os métodos de pagamento
  document.querySelectorAll('input[name="paymentMethod"]').forEach(method => {
    method.addEventListener('change', function() {
      document.getElementById('trocoField').style.display = 
        this.value === 'Dinheiro' ? 'block' : 'none';
    });
  });

  // Configura o botão do WhatsApp
  document.getElementById('whatsappBtn').addEventListener('click', function(e) {
    if (cart.length === 0) {
      e.preventDefault();
      alert('Por favor, adicione itens ao carrinho');
      return;
    }
    
    if (!validarFormulario()) {
      e.preventDefault();
      return;
    }
    
    updateWhatsAppLink();
  });
  // Também envia o pedido para o sistema do restaurante
  fetch("http://127.0.0.1:5000/api/pedidos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ conteudo: msg })
  });
  


  // Inicializa a exibição dos campos
  toggleEnderecoFields();
});