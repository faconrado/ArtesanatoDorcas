import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
// IMPORTANTE: Adicionando o serviço de Autenticação
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8GI5DCS-qsjqNcSqQVzPRJBhnWJDtYmw",
  authDomain: "galeriaartesanatodorcas.firebaseapp.com",
  projectId: "galeriaartesanatodorcas",
  storageBucket: "galeriaartesanatodorcas.firebasestorage.app",
  messagingSenderId: "1069158701689",
  appId: "1:1069158701689:web:283088e85a001a5a2812a8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Inicializa a autenticação

// Elementos da Galeria
const btnAdicionar = document.getElementById('btnAdicionar');
const inputArquivo = document.getElementById('inputArquivo');
const swiperWrapper = document.getElementById('swiperWrapper');

// Elementos de Controle de Usuário
const btnExibirLogin = document.getElementById('btnExibirLogin');
const areaLogin = document.getElementById('areaLogin');
const loginEmail = document.getElementById('loginEmail');
const loginSenha = document.getElementById('loginSenha');
const btnLogar = document.getElementById('btnLogar');
const btnDeslogar = document.getElementById('btnDeslogar');

const meuSwiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: false,
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    pagination: { el: ".swiper-pagination", clickable: true },
});

function adicionarSlideNaTela(urlElemento) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    const img = document.createElement('img');
    img.src = urlElemento;
    img.alt = 'Trabalho Artesanato Dorcas';
    slide.appendChild(img);
    swiperWrapper.appendChild(slide);
    meuSwiper.update();
}

// --- MONITOR DE LOGIN (ESSENCIAL) ---
// O Firebase fica vigiando se há um administrador logado neste navegador
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Se o Administrador está logado:
    if(btnAdicionar) btnAdicionar.style.display = "block"; // Mostra botão de postar foto
    if(btnDeslogar) btnDeslogar.style.display = "inline-block"; // Mostra botão de Sair
    if(areaLogin) areaLogin.style.display = "none";     // Esconde o formulário de login
    if(btnExibirLogin) btnExibirLogin.style.display = "none"; // Esconde o botão discreto "Acesso Restrito"
  } else {
    // Se for um visitante comum:
    if(btnAdicionar) btnAdicionar.style.display = "none";  // Esconde o botão de postar foto
    if(btnDeslogar) btnDeslogar.style.display = "none";   // Esconde o botão de Sair
    if(btnExibirLogin) btnExibirLogin.style.display = "block"; // Deixa o "Acesso Restrito" disponível
  }
});

// Ação de Exibir o painel de login ao clicar no rodapé secreto
if (btnExibirLogin) {
    btnExibirLogin.addEventListener('click', () => {
        areaLogin.style.display = areaLogin.style.display === "none" ? "block" : "none";
    });
}

// Executa o processo de Login com o Firebase
if (btnLogar) {
    btnLogar.addEventListener('click', async () => {
        const email = loginEmail.value;
        const senha = loginSenha.value;
        try {
            await signInWithEmailAndPassword(auth, email, senha);
            alert("Modo Administrador Ativado!");
            loginEmail.value = "";
            loginSenha.value = "";
        } catch (erro) {
            console.error(erro);
            alert("Acesso negado. Dados incorretos.");
        }
    });
}

// Ação de Deslogar (Sair do Modo Admin)
if (btnDeslogar) {
    btnDeslogar.addEventListener('click', () => {
        signOut(auth);
        alert("Você saiu do modo administrador.");
    });
}

// --- FLUXO DE UPLOAD (APENAS SE O BOTÃO ESTIVER VISÍVEL) ---
if (btnAdicionar && inputArquivo) {
    btnAdicionar.addEventListener('click', () => { inputArquivo.click(); });

    inputArquivo.addEventListener('change', async (e) => {
      const arquivo = e.target.files[0]; 
      if (!arquivo) return;

      try {
        btnAdicionar.innerText = "Enviando imagem...";
        btnAdicionar.disabled = true;

        const nomeArquivoUnico = `${Date.now()}_${arquivo.name}`;
        const pastaStorageRef = ref(storage, `galeriaDorcas/${nomeArquivoUnico}`);
        await uploadBytes(pastaStorageRef, arquivo);

        const urlNuvem = await getDownloadURL(pastaStorageRef);

        await addDoc(collection(db, "imagens"), {
          url: urlNuvem,
          criadoEm: Date.now()
        });

        adicionarSlideNaTela(urlNuvem);
        meuSwiper.slideTo(meuSwiper.slides.length - 1);
        alert("Imagem adicionada com sucesso!");

      } catch (erro) {
        console.error("Falha no upload:", erro);
        alert("Erro de permissão: Apenas o administrador pode enviar fotos.");
      } finally {
        btnAdicionar.innerText = "Adicionar Imagem";
        btnAdicionar.disabled = false;
        inputArquivo.value = "";
      }
    });
}

async function carregarGaleria() {
    if (!swiperWrapper) return;
    try {
        const consulta = query(collection(db, "imagens"), orderBy("criadoEm", "asc"));
        const snapshot = await getDocs(consulta);
        snapshot.forEach((doc) => {
            const dados = doc.data();
            adicionarSlideNaTela(dados.url);
        });
    } catch (erro) {
        console.error("Erro ao carregar imagens:", erro);
    }
}

carregarGaleria();