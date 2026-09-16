const leds = document.querySelectorAll(".ld");
const cards = document.querySelectorAll('.card');
const popup = document.getElementById('popup');
const overlay = document.getElementById('overlay');
const btnFechar = document.getElementById('btnFechar');
const popupConteudo = document.querySelector('.popup-conteudo');
const btnGrafico = document.getElementById('btnGrafico');
const cardGrafico = document.getElementById('cardGrafico');

leds.forEach(led => {
    led.addEventListener("click", function(event) {
        event.preventDefault(); 
        alert("Você ligou o: " + this.textContent);
    });
});

const dadosSensores = {
    "Dispositivo": "<p><strong>Modelo:</strong> ESP32</p><p><strong>Status:</strong> Online</p>",
    "Data": "<p><strong>Última atualização:</strong> 16/09/2026 11:00</p>",
    "Altitude": "<p><strong>Valor:</strong> 760 metros</p>",
    "Pressão": "<p><strong>Valor:</strong> 1013.25 hPa</p>",
    "Umidade": "<p><strong>Valor:</strong> 65%</p>",
    "Temperatura": "<p><strong>Valor:</strong> 24.5 °C</p>"
};

cards.forEach(card => {
    card.addEventListener('click', () => {
        const nomeSensor = card.getAttribute('data-sensor');
        const conteudoInfo = dadosSensores[nomeSensor] || "<p>Sem dados disponíveis.</p>";
        popupConteudo.innerHTML = `<h2 id="popupTitulo">${nomeSensor}</h2>${conteudoInfo}`;

        popup.classList.add('ativo');
        overlay.classList.add('ativo');
    });
});

function fecharPopup() {
    popup.classList.remove('ativo');
    overlay.classList.remove('ativo');
}

btnFechar.addEventListener('click', fecharPopup);
overlay.addEventListener('click', fecharPopup);

btnGrafico.addEventListener('click', () => {
    cardGrafico.classList.toggle('escondido');

    if (cardGrafico.classList.contains('escondido')) {
        btnGrafico.textContent = 'Ver Gráfico';
    } else {
        btnGrafico.textContent = 'Ocultar Gráfico';
        renderizarGrafico('Pressão'); 
    }
});

const dadosGraficos = {
    "Pressão": [1013, 1012, 1015, 1011, 1016, 1014, 1018],
    "Umidade": [60, 65, 58, 70, 52, 48, 55],
    "Temp": [22, 23, 25, 24, 26, 28, 27],
    "Altitude": [750, 752, 749, 755, 753, 750, 754]
};

function gerarCaminhoSuave(pts) {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? i : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

function renderizarGrafico(tipo) {
    const valores = dadosGraficos[tipo];
    if (!valores) return;

    const width = 500;
    const height = 200;
    const margin = 25;

    const minVal = Math.min(...valores);
    const maxVal = Math.max(...valores);
    const range = (maxVal - minVal) || 1;
    const stepX = width / (valores.length - 1);


    const pontos = valores.map((val, i) => ({
        x: i * stepX,
        y: height - margin - ((val - minVal) / range) * (height - (margin * 2)),
        valor: val
    }));

   
    const pathD = gerarCaminhoSuave(pontos);

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    let pontosHTML = "";
    pontos.forEach(p => {
        pontosHTML += `<circle cx="${p.x}" cy="${p.y}" class="ponto-grafico"><title>${tipo}: ${p.valor}</title></circle>`;
    });

    document.getElementById('pathGrafico').setAttribute('d', pathD);
    document.getElementById('pathArea').setAttribute('d', areaD);
    document.getElementById('pontosGrafico').innerHTML = pontosHTML;
}

const botoesGrafico = document.querySelectorAll('.butao-gra button');
botoesGrafico.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesGrafico.forEach(btn => btn.classList.remove('ativo'));
        botao.classList.add('ativo');

        const tipoSensor = botao.getAttribute('data-tipo');
        renderizarGrafico(tipoSensor);
    });
});