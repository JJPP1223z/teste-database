const apiToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTkwZjhlNDFhNjg4ZGJjOGRkMGM1YTQ2MWVmMjA4NCIsIm5iZiI6MTcyODI2NDA1NC4wNTIzODUsInN1YiI6IjY3MDE4MTNmYzlhMTBkNDZlYTdkMWM1YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.QkknZ2vqEE8enp_mj8jBeNGddASJUXeH_wCyTSWB0bE'; // Insira seu token aqui
const filmeInput = document.getElementById('filmeInput');
const suggestions = document.getElementById('suggestions');
const listaFilmes = document.getElementById('listaFilmes');
const feedbackContainer = document.getElementById('feedback');
const assistidosCheckbox = document.getElementById('assistidosCheckbox');
const seriesCheckbox = document.getElementById('seriesCheckbox');
const filmesCheckbox = document.getElementById('filmesCheckbox');
const assistidosCount = document.getElementById('assistidosCount');
const seriesCount = document.getElementById('seriesCount');
const filmesCount = document.getElementById('filmesCount');
// Carregar a lista de filmes ao iniciar
document.addEventListener('DOMContentLoaded', carregarLista);
function carregarLista() {
    const filmesSalvos = JSON.parse(localStorage.getItem('filmes')) || [];
    filmesSalvos.forEach(filme => {
        const item = {
            title: filme.item.title,
            poster_path: filme.item.poster_path ? `https://image.tmdb.org/t/p/w200${filme.item.poster_path}` : '' // Reconstrói o caminho completo
        };
        adicionarFilmeNaLista(item, filme.assistido);
    });
}
// Exibir sugestões de filmes
filmeInput.addEventListener('input', function () {
    const filmeNome = filmeInput.value.trim();
    if (filmeNome) {
        buscarSugestoes(filmeNome);
    } else {
        suggestions.innerHTML = '';
        feedbackContainer.innerHTML = '';
    }
});
function buscarSugestoes(filmeNome) {
    const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(filmeNome)}&language=pt-BR`;
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        mostrarSugestoes(data.results);
    })
    .catch(error => console.error('Erro ao buscar sugestões:', error));
}
function mostrarSugestoes(sugestoes) {
    suggestions.innerHTML = '';
    sugestoes.forEach(item => {
        if (item.media_type === 'movie' || item.media_type === 'tv') {
            const div = document.createElement('div');
            const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '';
            div.innerHTML = `
                <img src="${posterUrl}" alt="${item.title || item.name}" width="50" height="75">
                <span>${item.title || item.name}</span>
            `;
            div.onclick = function () {
                adicionarFilmeNaLista(item);
                filmeInput.value = '';
                suggestions.innerHTML = '';
                feedbackContainer.innerHTML = '';
            };
            suggestions.appendChild(div);
        }
    });
}
function adicionarFilmeNaLista(item, assistido = false) {
    const filmeExistente = Array.from(listaFilmes.children).some(li => {
        const title = li.querySelector('strong').textContent;
        return title === item.title || title === item.name;
    });
    if (filmeExistente) {
        mostrarFeedback('Este filme já está na lista!', 'red');
        return;
    }
    const li = document.createElement('li');
    const posterUrl = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '';
    li.innerHTML = `
        <img src="${posterUrl}" alt="${item.title || item.name}" width="50" height="75" style="float: left; margin-right: 10px;">
        <div class="filme-info">
            <strong>${item.title || item.name}</strong>
            <button class="assistido-button">${assistido ? 'Desmarcar Assistido' : 'Assistido'}</button>
            <button class="remover-button">Remover</button>
        </div>
    `;
    li.classList.toggle('assistido', assistido);
    // Adiciona ouvintes de eventos para os botões
    li.querySelector('.assistido-button').onclick = function () {
        assistido = !assistido;
        li.classList.toggle('assistido', assistido);
        li.querySelector('.assistido-button').textContent = assistido ? 'Desmarcar Assistido' : 'Assistido';
        atualizarLocalStorage();
        atualizarContadores();
    };
    li.querySelector('.remover-button').onclick = function () {
        listaFilmes.removeChild(li);
        mostrarFeedback('Filme removido com sucesso!', 'green');
        atualizarLocalStorage();
        atualizarContadores();
    };
    listaFilmes.appendChild(li);
    atualizarLocalStorage();
    atualizarContadores();
}
// Função para atualizar o localStorage
function atualizarLocalStorage() {
    const filmesSalvos = [];
    Array.from(listaFilmes.children).forEach(li => {
        const title = li.querySelector('strong').textContent;
        const assistido = li.classList.contains('assistido');
        const posterUrl = li.querySelector('img').src;
        const posterPath = posterUrl.replace('https://image.tmdb.org/t/p/w200', ''); // Armazena apenas o caminho relativo
        filmesSalvos.push({
            item: {
                title,
                poster_path: posterPath // Salva apenas o `poster_path`
            },
            assistido
        });
    });
    localStorage.setItem('filmes', JSON.stringify(filmesSalvos));
}
// Função para atualizar os contadores
function atualizarContadores() {
    const totalFilmes = listaFilmes.children.length;
    const assistidos = Array.from(listaFilmes.children).filter(li => li.classList.contains('assistido')).length;
    const series = Array.from(listaFilmes.children).filter(li => li.querySelector('strong').textContent.includes('Série')).length;
    const filmes = Array.from(listaFilmes.children).filter(li => li.querySelector('strong').textContent.includes('Filme')).length;
    assistidosCount.textContent = assistidos;
    seriesCount.textContent = series;
    filmesCount.textContent = filmes;
    // Aplicar filtros
    aplicarFiltros();
}
// Função para aplicar filtros
function aplicarFiltros() {
    const filmes = Array.from(listaFilmes.children);
    filmes.forEach(li => {
        const isAssistido = li.classList.contains('assistido');
        const isSerie = li.querySelector('strong').textContent.includes('Série');
        const isFilme = li.querySelector('strong').textContent.includes('Filme');
        const mostrar = (!assistidosCheckbox.checked || isAssistido) &&
                        (!seriesCheckbox.checked || isSerie) &&
                        (!filmesCheckbox.checked || isFilme);
        li.style.display = mostrar ? '' : 'none';
    });
}
// Função para mostrar feedback
function mostrarFeedback(mensagem, cor) {
    feedbackContainer.innerHTML = `<p style="color: ${cor};">${mensagem}</p>`;
    setTimeout(() => {
        feedbackContainer.innerHTML = '';
    }, 3000); // Limpa a mensagem após 3 segundos
}
// Adiciona ouvintes para os checkboxes de filtro
assistidosCheckbox.addEventListener('change', aplicarFiltros);
seriesCheckbox.addEventListener('change', aplicarFiltros);
filmesCheckbox.addEventListener('change', aplicarFiltros);
