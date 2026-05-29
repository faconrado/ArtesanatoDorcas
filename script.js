const btnAdicionar = document.getElementById('btnAdicionar');
const inputArquivo = document.getElementById('inputArquivo');
const swiperWrapper = document.getElementById('swiperWrapper');

var swiper = new Swiper(".swiper", {
    direction: "horizontal",
    cssMode: true,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
},
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    mousewheel: true,
    keyboard: true,
    scrollbar: {
      el: ".swiper-scrollbar",
    },  
});

// Inicializa o Swiper
const meuSwiper = new Swiper('.swiper', {
  direction: 'horizontal',
  loop: false,
});

// Adicionar a janela de upload do sistema operacional ao clicar no botão
btnAdicionar.addEventListener('click', () => inputArquivo.click());

// Processa o arquivo selecionado e adiciona à galeria
inputArquivo.addEventListener('change', (e) => {
  const arquivo = e.target.files[0];
  if (!arquivo) return;

  // Gerar link tempórario da arquivo local
  const urlImagem = URL.createObjectURL(arquivo);

  // Monta o elemento HTML
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');
  slide.innerHTML = '<img src="${urlImagem}" alt="Slide Novo">';

  // Insere no final e atualiza o componente
  swiperWrapper.appendChild(slide);
  meuSwiper.update();

  // Reseta o campo de upload
  inputArquivo.value = '';
});
