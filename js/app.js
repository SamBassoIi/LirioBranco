// ============================================================
// VERSÃO DEMONSTRAÇÃO (PORTFÓLIO) - SEM CONEXÃO COM O GOOGLE
// Salva apenas no navegador do usuário (LocalStorage)
// ============================================================

let localDb = JSON.parse(localStorage.getItem('lirio_demo_db')) || { produtos: [], clientes: [], pedidos: [], despesas: [] };
let fotosTemp = []; 
let reciboAtualId = null;

// Salva os dados localmente
window.salvarDb = function() { localStorage.setItem('lirio_demo_db', JSON.stringify(localDb)); };
// Gera IDs aleatórios (já que não temos o Google para gerar)
window.gerarId = function() { return Math.random().toString(36).substr(2, 9); };

// --- NAVEGAÇÃO E ANIMAÇÕES ---
window.mudarAba = function(abaId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('aba-' + abaId).classList.add('active');
    element.classList.add('active');
    if (abaId === 'sophia') window.tocarAnimacaoLirio();
};

window.abrirModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.fecharModal = function(id) { document.getElementById(id).style.display = 'none'; };

window.tocarAnimacaoLirio = function() {
    const intro = document.getElementById('lilyIntro'); const content = document.querySelector('.love-content');
    if(intro && content) { intro.style.display = 'flex'; intro.style.opacity = '1'; content.style.opacity = '0'; setTimeout(() => { intro.style.opacity = '0'; setTimeout(() => { intro.style.display = 'none'; }, 1000); content.style.opacity = '1'; }, 3500); }
};

window.mudarFotoCarrosselAmor = function() {
    const imgs = document.querySelectorAll('.love-carousel .love-img'); if(imgs.length === 0) return;
    let activeIdx = Array.from(imgs).findIndex(img => img.classList.contains('active'));
    if(activeIdx >= 0) imgs[activeIdx].classList.remove('active');
    let nextIdx = (activeIdx + 1) % imgs.length; imgs[nextIdx].classList.add('active');
};

window.criarPetalas = function() {
    const container = document.getElementById('petalsContainer'); if(!container) return;
    setInterval(() => { const petal = document.createElement('div'); petal.classList.add('f-petal'); petal.style.left = Math.random() * 100 + 'vw'; petal.style.animationDuration = (Math.random() * 5 + 5) + 's'; petal.style.opacity = Math.random(); container.appendChild(petal); setTimeout(() => petal.remove(), 10000); }, 800);
};

window.onload = () => {
    window.renderEstoque(); window.renderClientes(); window.renderPedidos(); window.renderFinanceiro(); window.preencherSelectsPedido();
    window.criarPetalas(); setInterval(window.mudarFotoCarrosselAmor, 4000);
    window.showToast("Modo de Demonstração Ativado!", "info");
};

window.showToast = function(msg, type='success') { try { Toastify({ text: msg, duration: 3000, style: { background: type === 'error' ? "#e74c3c" : "#D49A9F" } }).showToast(); } catch(e) { alert(msg); } };

// --- FINANCEIRO ---
window.abrirModalDespesa = function() { document.getElementById('despDesc').value = ''; document.getElementById('despValor').value = ''; window.abrirModal('modalDespesa'); };
window.salvarDespesa = function() {
    const desc = document.getElementById('despDesc').value.trim(); const valor = parseFloat(document.getElementById('despValor').value);
    if(!desc || !valor || valor <= 0) return Swal.fire('Erro', 'Preencha a descrição e o valor válido.', 'error');
    localDb.despesas.push({ id: window.gerarId(), data: new Date().toLocaleDateString('pt-BR'), desc: desc, valor: valor, timestamp: Date.now() });
    window.salvarDb(); window.renderFinanceiro(); window.showToast("Custo registrado!"); window.fecharModal('modalDespesa');
};
window.deletarDespesa = function(id) {
    Swal.fire({ title: 'Apagar Custo?', icon: 'warning', showCancelButton: true }).then((r) => {
        if (r.isConfirmed) { localDb.despesas = localDb.despesas.filter(d => d.id !== id); window.salvarDb(); window.renderFinanceiro(); window.showToast("Excluído."); }
    });
};
window.renderFinanceiro = function() {
    const tbody = document.getElementById('tabelaDespesas'); if(!tbody) return; tbody.innerHTML = '';
    let totalDespesas = 0; let totalReceitas = 0;
    const sortedDespesas = [...localDb.despesas].sort((a, b) => b.timestamp - a.timestamp);
    sortedDespesas.forEach(d => { totalDespesas += d.valor; tbody.innerHTML += `<tr><td>${d.data}</td><td><strong>${d.desc}</strong></td><td style="text-align:right; color:#e74c3c;">R$ ${d.valor.toFixed(2)}</td><td class="action-cell"><button class="btn-icon del" onclick="window.deletarDespesa('${d.id}')"><i class="fas fa-trash"></i></button></td></tr>`; });
    localDb.pedidos.forEach(p => totalReceitas += p.total);
    document.getElementById('dashReceitas').innerText = `R$ ${totalReceitas.toFixed(2)}`; document.getElementById('dashDespesas').innerText = `R$ ${totalDespesas.toFixed(2)}`; document.getElementById('dashLucro').innerText = `R$ ${(totalReceitas - totalDespesas).toFixed(2)}`;
};
window.exportarFinanceiroExcel = function() { window.showToast("Função Excel desabilitada no modo Demo.", "info"); };

// --- PRODUTOS ---
window.abrirModalProduto = function() { document.getElementById('tituloModalProduto').innerText = "Cadastrar Produto"; document.getElementById('prodId').value = ''; document.getElementById('prodNome').value = ''; document.getElementById('prodQtd').value = '1'; document.getElementById('prodPreco').value = ''; document.getElementById('prodImgInput').value = ''; document.getElementById('prodMaterial').value = 'Dourado'; fotosTemp = []; window.atualizarPreviewFotos(); window.abrirModal('modalProduto'); };
window.editarProduto = function(id) { const p = localDb.produtos.find(x => x.id === id); if(!p) return; document.getElementById('tituloModalProduto').innerText = "Editar Produto"; document.getElementById('prodId').value = p.id; document.getElementById('prodNome').value = p.nome; document.getElementById('prodCat').value = p.categoria; document.getElementById('prodQtd').value = p.qtd; document.getElementById('prodPreco').value = p.preco; document.getElementById('prodMaterial').value = p.material || 'Outros'; document.getElementById('prodImgInput').value = ''; fotosTemp = p.imagens ? [...p.imagens] : []; window.atualizarPreviewFotos(); window.abrirModal('modalProduto'); };
window.processarImagens = function(input) { if(input.files && input.files.length > 0) { Array.from(input.files).forEach(file => { const reader = new FileReader(); reader.onload = function(e) { const img = new Image(); img.onload = function() { const canvas = document.createElement('canvas'); const MAX_WIDTH = 400; const MAX_HEIGHT = 400; let width = img.width; let height = img.height; if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); fotosTemp.push(canvas.toDataURL('image/jpeg', 0.8)); window.atualizarPreviewFotos(); }; img.src = e.target.result; }; reader.readAsDataURL(file); }); } };
window.removerFotoTemp = function(index) { fotosTemp.splice(index, 1); window.atualizarPreviewFotos(); };
window.atualizarPreviewFotos = function() { const container = document.getElementById('prodImgPreviewContainer'); container.innerHTML = ''; fotosTemp.forEach((src, idx) => { container.innerHTML += `<div class="photo-preview"><img src="${src}"><button onclick="window.removerFotoTemp(${idx})"><i class="fas fa-times"></i></button></div>`; }); };
window.salvarProduto = function() { const idInput = document.getElementById('prodId').value; const nome = document.getElementById('prodNome').value.trim(); const cat = document.getElementById('prodCat').value; const mat = document.getElementById('prodMaterial').value; const qtd = parseInt(document.getElementById('prodQtd').value) || 0; const preco = parseFloat(document.getElementById('prodPreco').value) || 0; if(!nome || preco <= 0) return Swal.fire('Erro', 'Preencha os dados.', 'error'); 
    const produtoData = { id: idInput || window.gerarId(), nome, categoria: cat, material: mat, qtd, preco, imagens: [...fotosTemp] };
    if(idInput) { const idx = localDb.produtos.findIndex(p => p.id === idInput); localDb.produtos[idx] = produtoData; window.showToast("Atualizado!"); } else { localDb.produtos.push(produtoData); window.showToast("Cadastrado!"); }
    window.salvarDb(); window.renderEstoque(); window.preencherSelectsPedido(); window.fecharModal('modalProduto');
};
window.deletarProduto = function(id) { Swal.fire({ title: 'Excluir?', icon: 'warning', showCancelButton: true }).then((r) => { if (r.isConfirmed) { localDb.produtos = localDb.produtos.filter(p => p.id !== id); window.salvarDb(); window.renderEstoque(); window.preencherSelectsPedido(); window.showToast("Excluído."); } }); };
window.passarFoto = function(id, direcao) { const imgs = document.querySelectorAll(`.img-${id}`); if(imgs.length <= 1) return; let activeIdx = Array.from(imgs).findIndex(img => img.classList.contains('active')); imgs[activeIdx].classList.remove('active'); if(direcao === 'prox') activeIdx = (activeIdx + 1) % imgs.length; else activeIdx = (activeIdx - 1 + imgs.length) % imgs.length; imgs[activeIdx].classList.add('active'); };
window.criarCardProduto = function(p) { let imgHtml = ''; const listaFotos = p.imagens && p.imagens.length > 0 ? p.imagens : (p.imagem ? [p.imagem] : []); if(listaFotos.length === 0) imgHtml = `<div class="carousel-container"><div class="product-img" style="display:flex;align-items:center;justify-content:center;font-size:40px;color:#ddd"><i class="fas fa-gem"></i></div></div>`; else if (listaFotos.length === 1) imgHtml = `<div class="carousel-container"><img src="${listaFotos[0]}" class="carousel-img active"></div>`; else { imgHtml = `<div class="carousel-container">`; listaFotos.forEach((src, idx) => { imgHtml += `<img src="${src}" class="carousel-img img-${p.id} ${idx === 0 ? 'active' : ''}">`; }); imgHtml += `<button class="carousel-btn left" onclick="window.passarFoto('${p.id}', 'ant')"><i class="fas fa-chevron-left"></i></button><button class="carousel-btn right" onclick="window.passarFoto('${p.id}', 'prox')"><i class="fas fa-chevron-right"></i></button></div>`; } return `<div class="product-card"><button class="btn-edit-prod" onclick="window.editarProduto('${p.id}')"><i class="fas fa-pen"></i></button><button class="btn-del-prod" onclick="window.deletarProduto('${p.id}')"><i class="fas fa-trash"></i></button>${imgHtml}<div class="product-info"><div class="product-cat">${p.categoria}</div><div class="product-name">${p.nome}</div><div class="product-price">R$ ${p.preco.toFixed(2)}</div><div class="product-stock">Estoque: <span class="stock-badge">${p.qtd} un</span></div></div></div>`; };
window.renderEstoque = function() { const gridD = document.getElementById('gridDourados'); const gridP = document.getElementById('gridPratas'); const gridO = document.getElementById('gridOutros'); const divO = document.getElementById('containerOutros'); if(!gridD) return; gridD.innerHTML = ''; gridP.innerHTML = ''; gridO.innerHTML = ''; let temOutros = false; const sorted = [...localDb.produtos].sort((a,b) => a.nome.localeCompare(b.nome)); sorted.forEach(p => { const card = window.criarCardProduto(p); if (p.material === 'Dourado') gridD.innerHTML += card; else if (p.material === 'Prata') gridP.innerHTML += card; else { gridO.innerHTML += card; temOutros = true; } }); if(!gridD.innerHTML) gridD.innerHTML = '<p style="color:#ccc; font-style:italic">Vazio.</p>'; if(!gridP.innerHTML) gridP.innerHTML = '<p style="color:#ccc; font-style:italic">Vazio.</p>'; divO.style.display = temOutros ? 'block' : 'none'; };

// --- CLIENTES ---
window.abrirModalCliente = function() { document.getElementById('tituloModalCliente').innerText = "Cadastrar Cliente"; document.getElementById('cliId').value = ''; document.getElementById('cliNome').value = ''; document.getElementById('cliTel').value = ''; document.getElementById('cliObs').value = ''; window.abrirModal('modalCliente'); };
window.editarCliente = function(id) { const c = localDb.clientes.find(x => x.id === id); if(!c) return; document.getElementById('tituloModalCliente').innerText = "Editar Cliente"; document.getElementById('cliId').value = c.id; document.getElementById('cliNome').value = c.nome; document.getElementById('cliTel').value = c.tel; document.getElementById('cliObs').value = c.obs; window.abrirModal('modalCliente'); };
window.salvarCliente = function() { const idInput = document.getElementById('cliId').value; const nome = document.getElementById('cliNome').value.trim(); const tel = document.getElementById('cliTel').value; const obs = document.getElementById('cliObs').value; if(!nome) return Swal.fire('Erro', 'Nome obrigatório.', 'error'); const cliData = { id: idInput || window.gerarId(), nome, tel, obs }; if(idInput) { const idx = localDb.clientes.findIndex(c => c.id === idInput); localDb.clientes[idx] = cliData; window.showToast("Atualizado!"); } else { localDb.clientes.push(cliData); window.showToast("Cadastrado!"); } window.salvarDb(); window.renderClientes(); window.preencherSelectsPedido(); window.fecharModal('modalCliente'); };
window.deletarCliente = function(id) { Swal.fire({ title: 'Excluir?', icon: 'warning', showCancelButton: true }).then((r) => { if (r.isConfirmed) { localDb.clientes = localDb.clientes.filter(c => c.id !== id); window.salvarDb(); window.renderClientes(); window.preencherSelectsPedido(); window.showToast("Excluído."); } }); };
window.renderClientes = function() { const tbody = document.getElementById('tabelaClientes'); if(!tbody) return; tbody.innerHTML = ''; [...localDb.clientes].reverse().forEach(c => { tbody.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td>${c.tel || '-'}</td><td><small>${c.obs || '-'}</small></td><td class="action-cell"><button class="btn-icon edit" onclick="window.editarCliente('${c.id}')"><i class="fas fa-pen"></i></button><button class="btn-icon del" onclick="window.deletarCliente('${c.id}')"><i class="fas fa-trash"></i></button></td></tr>`; }); };

// --- PEDIDOS ---
let pedidoTemp = [];
window.abrirModalPedido = function() { if(localDb.clientes.length === 0) return Swal.fire('Aviso', 'Cadastre cliente.', 'info'); if(localDb.produtos.length === 0) return Swal.fire('Aviso', 'Estoque vazio.', 'info'); pedidoTemp = []; window.atualizarSacola(); window.abrirModal('modalPedido'); };
window.preencherSelectsPedido = function() { const selCli = document.getElementById('pedCliente'); const selProd = document.getElementById('pedProduto'); if(selCli) { selCli.innerHTML = ''; localDb.clientes.forEach(c => selCli.innerHTML += `<option value="${c.id}">${c.nome}</option>`); } if(selProd) { selProd.innerHTML = ''; localDb.produtos.forEach(p => selProd.innerHTML += `<option value="${p.id}">${p.nome} (${p.material})</option>`); } };
window.addProdutoAoPedido = function() { const prodId = document.getElementById('pedProduto').value; const qtd = parseInt(document.getElementById('pedProdQtd').value) || 1; const prod = localDb.produtos.find(p => p.id === prodId); if(prod) { if(qtd > prod.qtd) return Swal.fire('Ops', `Estoque insuficiente (${prod.qtd}).`, 'error'); const existente = pedidoTemp.find(i => i.id === prod.id); if(existente) { if((existente.qtdPedida + qtd) > prod.qtd) return Swal.fire('Ops', 'Limite atingido.', 'error'); existente.qtdPedida += qtd; } else { pedidoTemp.push({ id: prod.id, nome: prod.nome, preco: prod.preco, qtdPedida: qtd }); } window.atualizarSacola(); } };
window.atualizarSacola = function() { const div = document.getElementById('pedSacola'); let total = 0; if(pedidoTemp.length === 0) { div.innerHTML = 'Vazio.'; document.getElementById('pedTotalDisp').innerText = 'R$ 0,00'; return; } div.innerHTML = ''; pedidoTemp.forEach((item, index) => { const sub = item.preco * item.qtdPedida; total += sub; div.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee"><span>${item.qtdPedida}x ${item.nome}</span><span>R$ ${sub.toFixed(2)} <button onclick="window.removerDaSacola(${index})" style="border:none; background:none; color:red; cursor:pointer">&times;</button></span></div>`; }); document.getElementById('pedTotalDisp').innerText = `R$ ${total.toFixed(2)}`; };
window.removerDaSacola = function(index) { pedidoTemp.splice(index, 1); window.atualizarSacola(); };
window.finalizarPedido = function() { 
    if(pedidoTemp.length === 0) return Swal.fire('Aviso', 'Sacola vazia!', 'info'); 
    const cliId = document.getElementById('pedCliente').value; const cliente = localDb.clientes.find(c => c.id === cliId); let total = 0; 
    for (const item of pedidoTemp) { total += item.preco * item.qtdPedida; const pIdx = localDb.produtos.findIndex(p => p.id === item.id); if(pIdx >= 0) { localDb.produtos[pIdx].qtd -= item.qtdPedida; } } 
    const novoPedido = { id: window.gerarId(), data: new Date().toLocaleDateString('pt-BR'), clienteNome: cliente.nome, itens: pedidoTemp, total: total, timestamp: Date.now() }; 
    localDb.pedidos.push(novoPedido); window.salvarDb(); window.renderEstoque(); window.renderPedidos(); window.renderFinanceiro(); window.showToast("Venda Registrada!"); window.fecharModal('modalPedido'); window.gerarRecibo(novoPedido.id); 
};
window.deletarPedido = function(id) { Swal.fire({ title: 'Cancelar?', text: "Voltam ao estoque.", icon: 'warning', showCancelButton: true }).then((r) => { if (r.isConfirmed) { const ped = localDb.pedidos.find(p => p.id === id); if(ped) { for (const item of ped.itens) { const pIdx = localDb.produtos.findIndex(p => p.id === item.id); if(pIdx >= 0) { localDb.produtos[pIdx].qtd += item.qtdPedida; } } } localDb.pedidos = localDb.pedidos.filter(p => p.id !== id); window.salvarDb(); window.renderEstoque(); window.renderPedidos(); window.renderFinanceiro(); window.showToast("Cancelado."); } }); };
window.renderPedidos = function() { const tbody = document.getElementById('tabelaPedidos'); if(!tbody) return; tbody.innerHTML = ''; const sorted = [...localDb.pedidos].sort((a, b) => b.timestamp - a.timestamp); sorted.forEach(ped => { let qtd = ped.itens.reduce((sum, i) => sum + i.qtdPedida, 0); tbody.innerHTML += `<tr><td>${ped.data}</td><td>${ped.clienteNome}</td><td>${qtd}</td><td>R$ ${ped.total.toFixed(2)}</td><td class="action-cell"><button class="btn-icon" onclick="window.gerarRecibo('${ped.id}')"><i class="fas fa-receipt"></i></button><button class="btn-icon del" onclick="window.deletarPedido('${ped.id}')"><i class="fas fa-trash"></i></button></td></tr>`; }); };

window.gerarRecibo = function(idPedido) { const ped = localDb.pedidos.find(p => p.id === idPedido); if(!ped) return; reciboAtualId = idPedido; let html = `<div class="rcpt-header"><div class="rcpt-logo"><img src="logo.png" style="height:60px; object-fit:contain; border-radius:50%"></div><h2 class="rcpt-title">Lírio Branco</h2><div class="rcpt-subtitle">Acessórios</div></div><p class="rcpt-info"><strong>Data:</strong> ${ped.data}</p><p class="rcpt-info"><strong>Cliente:</strong> ${ped.clienteNome}</p><table class="rcpt-table"><thead><tr><th>Item</th><th style="text-align:center">Qtd</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>`; ped.itens.forEach(i => { html += `<tr><td>${i.nome}</td><td style="text-align:center">${i.qtdPedida}</td><td style="text-align:right">R$ ${(i.preco * i.qtdPedida).toFixed(2)}</td></tr>`; }); html += `</tbody></table><div class="rcpt-total">TOTAL: R$ ${ped.total.toFixed(2)}</div><div style="margin-top: 15px; text-align: center; font-size: 13px; border-top: 1px dashed #eee; padding-top: 15px; color: var(--text-main);"><strong>Pagamento via PIX:</strong><br><span style="font-size: 16px; letter-spacing: 1px; color: var(--primary-dark); font-weight: 600;">11913110931</span><br><small style="color: #999;">(Celular)</small></div><div class="rcpt-footer">Obrigado pela preferência!<br>@use.liriobranco</div>`; document.getElementById('conteudoRecibo').innerHTML = html; window.abrirModal('modalRecibo'); };
window.baixarImagemRecibo = function() { window.showToast("Gerando...", "success"); const ped = localDb.pedidos.find(p => p.id === reciboAtualId); const nomeLimpo = ped ? ped.clienteNome.replace(/[^a-zA-Z0-9]/g, '_') : 'Cliente'; html2canvas(document.getElementById('conteudoRecibo'), { scale: 2, backgroundColor: '#ffffff' }).then(canvas => { const link = document.createElement('a'); link.download = `Recibo_${nomeLimpo}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }); };

window.exportarEstoqueExcel = function() { window.showToast("Função Excel desabilitada no modo Demo.", "info"); };
window.exportarEstoquePDF = function() { window.showToast("Função PDF desabilitada no modo Demo.", "info"); };
window.migrarEstoqueParaNuvem = function() { window.showToast("Modo de Demonstração! Resgate desabilitado.", "info"); };