// 1. Importações dos módulos do Firebase via CDN estável
import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://gstatic.com";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://gstatic.com";

// 2. Insira aqui as configurações geradas no console do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8GI5DCS-qsjqNcSqQVzPRJBhnWJDtYmw",
  authDomain: "galeriaartesanatodorcas.firebaseapp.com",
  projectId: "galeriaartesanatodorcas",
  storageBucket: "galeriaartesanatodorcas.firebasestorage.app",
  messagingSenderId: "1069158701689",
  appId: "1:1069158701689:web:283088e85a001a5a2812a8"
};

// Inicialização dos serviços
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Seleção dos elementos do DOM
const btnAdicionar = document.getElementById('btnAdicionar');
const inputArquivo = document.getElementById('inputArquivo');
const swiperWrapper = document.getElementById('swiperWrapper');

// Inicializa o Swiper com setas e paginação que você colocou no HTML
const meuSwiper = new Swiper('.swiper', {
  direction: 'horizontal',
  loop: false,
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  scrollbar: { el: '.swiper-scrollbar' },
});

// Função para renderizar um novo slide na tela (no final)
function adicionarSlideNaTela(urlImagem) {
  const slide = document.createElement('div');
  slide.classList.add('swiper-slide');
  // BUG CORRIGIDO: Agora usando as crases `` corretamente para interpretar a URL
  slide.innerHTML = `<img src="${urlImagem}" alt="Slide Novo">`;
  
  swiperWrapper.appendChild(slide); // appendChild garante a inserção no final
  meuSwiper.update(); // Notifica o Swiper sobre o novo elemento
}

// 3. CARREGAR IMAGENS DA NUVEM (Executado ao abrir o site)
async function carregarImagensMundiais() {
  try {
    // Busca os dados da coleção "imagens" ordenando por data de criação
    const consulta = query(collection(db, "imagens"), orderBy("criadoEm", "asc"));
    const snapshot = await getDocs(consulta);
    
    // Adiciona cada imagem da nuvem sequencialmente após as 3 fotos fixas do HTML
    snapshot.forEach((doc) => {
      const dados = doc.data();
      adicionarSlideNaTela(dados.url);
    });
  } catch (erro) {
    console.error("Erro ao carregar galeria mundial:", erro);
  }
}

// Executa o carregamento assim que o site abre
carregarImagensMundiais();

// 4. EVENTO DE CLIQUE (Abre o gerenciador de arquivos)
btnAdicionar.addEventListener('click', () => inputArquivo.click());

// 5. EVENTO DE SELEÇÃO DE ARQUIVO (Faz o upload mundial)
inputArquivo.addEventListener('change', async (e) => {
  const arquivo = e.target.files[0]; // BUG CORRIGIDO: Adicionado o [0] para pegar o primeiro arquivo corretamente
  if (!arquivo) return;

  try {
    // Muda o estado do botão para feedback visual ao usuário
    btnAdicionar.innerText = "Enviando imagem...";
    btnAdicionar.disabled = true;

    // A. Upload do arquivo binário para o Storage com nome exclusivo baseado no tempo
    const nomeArquivoUnico = `${Date.now()}_${arquivo.name}`;
    const pastaStorageRef = ref(storage, `galeriaDorcas/${nomeArquivoUnico}`);
    await uploadBytes(pastaStorageRef, arquivo);

    // B. Recupera a URL pública que o Firebase gerou
    const urlNuvem = await getDownloadURL(pastaStorageRef);

    // C. Registra a URL e a data no banco de dados Firestore
    await addDoc(collection(db, "imagens"), {
      url: urlNuvem,
      criadoEm: Date.now()
    });

    // D. Cria o slide dinamicamente na tela e joga o foco do carrossel para ele
    adicionarSlideNaTela(urlNuvem);
    meuSwiper.slideTo(meuSwiper.slides.length - 1);

  } catch (erro) {
    console.error("Falha no upload do arquivo:", erro);
    alert("Não foi possível salvar sua foto na galeria mundial.");
  } finally {
    // Restaura o botão ao estado original independente de sucesso ou falha
    btnAdicionar.innerText = "Adicionar Imagem";
    btnAdicionar.disabled = false;
    inputArquivo.value = ''; // Limpa o seletor de arquivos
  }
});
