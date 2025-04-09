document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const destino = document.querySelector(this.getAttribute('href'));
        if (destino) {
            destino.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

let cart = [];

document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function () {
        const trocoField = document.getElementById('trocoField');
        trocoField.style.display = this.value === 'Dinheiro' ? 'block' : 'none';
        updateWhatsAppLink();
    });
});

document.getElementById('trocoPara').addEventListener('input', updateWhatsAppLink);
document.getElementById('customerName').addEventListener('input', updateWhatsAppLink);
document.getElementById('customerPhone').addEventListener('input', updateWhatsAppLink);

function showPizzaOptions(nome, preco) {
    document.querySelectorAll('.pizza-options').forEach(div => div.style.display = 'none');
    const pizzaOptionsDiv = Array.from(document.querySelectorAll('.pizza-options')).find(div => div.dataset.pizzaName === nome);
    if (!pizzaOptionsDiv) return;

    pizzaOptionsDiv.style.display = 'block';
    pizzaOptionsDiv.dataset.pizzaPrice = preco;
    pizzaOptionsDiv.dataset.pizzaName = nome;

    pizzaOptionsDiv.querySelector('h5').textContent = `Opções da Pizza ${nome}`;
    pizzaOptionsDiv.querySelectorAll('input[name^="tamanho-pizza-"]').forEach(r => r.checked = false);
    pizzaOptionsDiv.querySelectorAll('.sabores-pizza input[type="checkbox"]').forEach(c => c.checked = false);
    pizzaOptionsDiv.querySelector('.sabores-pizza').style.display = 'none';
}

function toggleSabores(button) {
    const saboresDiv = button.previousElementSibling;
    if (saboresDiv) {
        saboresDiv.style.display = saboresDiv.style.display === 'none' ? 'block' : 'none';
    }
}

function addPizzaToCart(optionsDiv) {
    const nome = optionsDiv.dataset.pizzaName;
    const precoBase = parseFloat(optionsDiv.dataset.pizzaPrice);
    const tamanhoSelecionado = optionsDiv.querySelector(`input[name="tamanho-pizza-${nome}"]:checked`);
    const saboresSelecionados = Array.from(optionsDiv.querySelectorAll('.sabores-pizza input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (!tamanhoSelecionado) {
        alert('Por favor, selecione um tamanho para a pizza.');
        return;
    }

    if (saboresSelecionados.length > 4) {
        alert('Você pode selecionar no máximo 4 sabores por pizza.');
        return;
    }

    let precoFinal = precoBase;
    const tamanho = tamanhoSelecionado.value;
    if (tamanho === 'Média') precoFinal += 5.00;
    else if (tamanho === 'Grande') precoFinal += 10.00;

    cart.push({
        item: nome,
        tamanho,
        sabores: saboresSelecionados,
        price: precoFinal
    });

    updateCart();
    updateResumoPedido();
    updateWhatsAppLink();

    optionsDiv.style.display = 'none';

    const pizzaCard = Array.from(document.querySelectorAll('.card h5')).find(h5 => h5.textContent === nome)?.closest('.card');
    if (pizzaCard) {
        const addButton = pizzaCard.querySelector('.btn-primary');
        if (addButton) {
            addButton.innerHTML = '<i class="bi bi-check2 me-1"></i>Adicionado';
            addButton.classList.remove('btn-primary');
            addButton.classList.add('btn-success');
            setTimeout(() => {
                addButton.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Detalhes';
                addButton.classList.remove('btn-success');
                addButton.classList.add('btn-primary');
            }, 1000);
        }
    }
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

function updateWhatsAppLink() {
    const btn = document.getElementById("whatsappBtn");
    const nome = document.getElementById('customerName').value;
    const tel = document.getElementById('customerPhone').value;
    const endereco = document.getElementById('customerAddress').value;
    const complemento = document.getElementById('customerComplement').value;
    const pagamento = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Não informado';
    const troco = document.getElementById('trocoPara').value;

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
