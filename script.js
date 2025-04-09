
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const destino = document.querySelector(this.getAttribute('href'));
        if (destino) {
            destino.scrollIntoView({ behavior: 'smooth' });
        }
    }); 
});


// Array do carrinho (certifique-se que existe)
let cart = [];

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
  let precoFinal = precoBase;
  
  // Ajuste por tamanho (P, M, G)
  if (tamanho === 'M') precoFinal += 5;
  else if (tamanho === 'G') precoFinal += 10;
  
  // Cálculo para 2 sabores (média dos preços)
  if (isDoisSabores && segundoSabor) {
    const precoSegundoSabor = getPrecoSabor(segundoSabor);
    precoFinal = (precoFinal + precoSegundoSabor) / 2;
  }

  // Nome do tamanho para exibição
  const nomeTamanho = tamanho === 'P' ? 'Pequena' : 
                     tamanho === 'M' ? 'Média' : 'Grande';

  // Descrição completa
  let descricao = `Pizza ${nomePizza}`;
  if (isDoisSabores) descricao += ` + ${segundoSabor}`;
  descricao += ` (${nomeTamanho})`;

  // Adiciona ao carrinho
  addToCart(descricao, precoFinal);

  // Feedback visual
  buttonFeedback(buttonElement);
}

// Função auxiliar para obter preços
function getPrecoSabor(nomeSabor) {
  const precos = {
    'Mussarela': 34.90,
    'Calabresa': 34.90,
    'Frango com Catupiry': 39.90,
    'Quatro Queijos': 44.90,
    'Portuguesa': 42.90,
    'Margherita': 38.90
  };
  return precos[nomeSabor] || 0;
}

// Função para adicionar itens genéricos ao carrinho
function addToCart(item, price) {
  cart.push({ item, price });
  updateCart();
  updateResumoPedido();
  updateWhatsAppLink();
}

// Atualiza a exibição do carrinho
function updateCart() {
  const list = document.getElementById("cartList");
  const totalElement = document.getElementById("cartTotal");
  let total = 0;

  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = '<li class="list-group-item empty-cart">Seu carrinho está vazio</li>';
    totalElement.textContent = "0.00";
    return;
  }

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${item.item} - R$ ${item.price.toFixed(2)}</span>
      <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">
        <i class="bi bi-trash"></i>
      </button>
    `;
    list.appendChild(li);
    total += item.price;
  });

  totalElement.textContent = total.toFixed(2);
}

// Remove item do carrinho
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
  updateResumoPedido();
  updateWhatsAppLink();
}

// Limpa o carrinho
function clearCart() {
  cart = [];
  updateCart();
  updateResumoPedido();
  updateWhatsAppLink();
}

// Feedback visual para botões
function buttonFeedback(button) {
  const originalHTML = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<i class="bi bi-check2 me-1"></i>Adicionado';
  button.classList.replace('btn-primary', 'btn-success');
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.classList.replace('btn-success', 'btn-primary');
    button.disabled = false;
  }, 2000);
}

// Mostrar/ocultar segundo sabor
document.querySelectorAll('.flavor-select').forEach(select => {
  select.addEventListener('change', function() {
    const card = this.closest('.card');
    const secondFlavorDiv = card.querySelector('.second-flavor');
    secondFlavorDiv.style.display = this.value === '2' ? 'block' : 'none';
  });
});

// Mantenha suas funções existentes de resumo e WhatsApp


// Função auxiliar para obter preço dos sabores
function getPrecoSabor(nomeSabor) {
  const precos = {
    'Mussarela': 34.90,
    'Calabresa': 34.90,
    'Frango com Catupiry': 39.90,
    'Quatro Queijos': 44.90,
    'Portuguesa': 42.90,
    'Margherita': 38.90
  };
  return precos[nomeSabor] || 0;
}

function addToCart(item, price) {
    cart.push({ item, price });
    updateCart();
    updateResumoPedido();
    updateWhatsAppLink();

    const btn = event.target;
    btn.innerHTML = '<i class="bi bi-check2 me-1"></i>Adicionado';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
    setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-cart-plus me-1"></i>Adicionar';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
    }, 1000);
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
    updateResumoPedido();
    updateWhatsAppLink();
}

function clearCart() {
    cart = [];
    updateCart();
    updateResumoPedido();
    updateWhatsAppLink();
}

function updateCart() {
    const list = document.getElementById("cartList");
    const total = document.getElementById("cartTotal");
    const btn = document.getElementById("whatsappBtn");

    list.innerHTML = "";
    let sum = 0;

    if (cart.length === 0) {
        list.innerHTML = '<li class="list-group-item empty-cart">Seu carrinho está vazio</li>';
        btn.classList.add("disabled");
        total.textContent = "0.00";
        return;
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        let descricao = item.item;
        if (item.tamanho) descricao += ` (${item.tamanho})`;
        if (item.sabores?.length > 0) descricao += ` - Sabores: ${item.sabores.join(', ')}`;
        li.innerHTML = `
            <span>${descricao} - R$ ${item.price.toFixed(2)}</span>
            <span class="remove-item" onclick="removeItem(${index})">
                <i class="bi bi-x-circle-fill"></i>
            </span>`;
        list.appendChild(li);
        sum += item.price;
    });

    total.textContent = sum.toFixed(2);
    btn.classList.remove("disabled");
}

function updateResumoPedido() {
    const resumoList = document.getElementById('resumo-pedido-lista');
    const resumoTotal = document.getElementById('resumo-pedido-total');
    resumoList.innerHTML = '';
    let totalPedido = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        let descricao = item.item;
        if (item.tamanho) descricao += ` (${item.tamanho})`;
        if (item.sabores?.length > 0) descricao += ` - Sabores: ${item.sabores.join(', ')}`;
        li.innerHTML = `<span>${descricao}</span> <strong>R$ ${item.price.toFixed(2)}</strong>`;
        resumoList.appendChild(li);
        totalPedido += item.price;
    });

    resumoTotal.textContent = totalPedido.toFixed(2);
}


// Adiciona eventos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Mostra/oculta campo de troco conforme método de pagamento
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  paymentMethods.forEach(method => {
      method.addEventListener('change', function() {
          const trocoField = document.getElementById('trocoField');
          trocoField.style.display = this.value === 'Dinheiro' ? 'block' : 'none';
      });
  });

  // Adiciona evento de clique ao botão do WhatsApp
  const whatsappBtn = document.getElementById('whatsappBtn');
  whatsappBtn.addEventListener('click', function(e) {
      // Valida campos obrigatórios
      const nome = document.getElementById('customerName').value;
      const tel = document.getElementById('customerPhone').value;
      const endereco = document.getElementById('customerAddress').value;
      
      if (!nome || !tel || !endereco) {
          e.preventDefault();
          alert('Por favor, preencha todos os campos obrigatórios (Nome, Telefone e Endereço)');
          return;
      }
      
      // Atualiza o link do WhatsApp
      updateWhatsAppLink();
      
      // Se o link estiver desabilitado, previne o clique
      if (this.classList.contains('disabled')) {
          e.preventDefault();
          alert('Por favor, adicione itens ao carrinho antes de finalizar o pedido');
      }
  });
});

function updateWhatsAppLink() {
  const btn = document.getElementById("whatsappBtn");
  const nome = document.getElementById('customerName').value;
  const tel = document.getElementById('customerPhone').value;
  const endereco = document.getElementById('customerAddress').value;
  const complemento = document.getElementById('customerComplement').value;
  const pagamento = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Não informado';
  const troco = document.getElementById('trocoPara').value;

  // Verifica se há itens no carrinho
  if (cart.length === 0) {
      btn.classList.add('disabled');
      return;
  } else {
      btn.classList.remove('disabled');
  }

  let msg = "Olá, gostaria de fazer o seguinte pedido:\n\n";
  cart.forEach(item => {
      let descricao = item.item;
      if (item.tamanho) descricao += ` (${item.tamanho})`;
      if (item.sabores?.length > 0) descricao += ` - Sabores: ${item.sabores.join(', ')}`;
      msg += `- ${descricao} - R$ ${item.price.toFixed(2)}\n`;
  });

  const total = parseFloat(document.getElementById("cartTotal").textContent);
  msg += `\n\n*Dados para Entrega:*`;
  msg += `\nNome: ${nome || 'Não informado'}`;
  msg += `\nTelefone: ${tel || 'Não informado'}`;
  msg += `\nEndereço: ${endereco || 'Não informado'}`;
  if (complemento) msg += `\nComplemento: ${complemento}`;
  msg += `\n\n*Pagamento:* ${pagamento}`;
  if (pagamento === 'Dinheiro' && troco) msg += `\nTroco para: R$ ${parseFloat(troco).toFixed(2)}`;
  msg += `\n\n*Total do Pedido:* R$ ${total.toFixed(2)}`;
  msg += `\n\nObrigado!`;

  const link = `https://wa.me/5581999862307?text=${encodeURIComponent(msg)}`;
  btn.href = link;
}
