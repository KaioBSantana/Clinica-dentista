

const API_URL = "https://firestore.googleapis.com/v1/projects/tcc-dentista/databases/(default)/documents/usuarios";

async function registrarUsuario(dados) {
  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          nome: { stringValue: dados.nome },
          email: { stringValue: dados.email },
          cpf: { stringValue: dados.cpf },
          telefone: { stringValue: dados.telefone },
          senha: { stringValue: dados.senha }
        }
      })
    });

    if (!resposta.ok) {
      const err = await resposta.text();
      throw new Error(err || "Resposta não OK ao registrar usuário");
    }

    const resultado = await resposta.json();
    console.log("Usuário salvo:", resultado);
    return { success: true, data: resultado };
  } catch (erro) {
    console.error("Erro ao registrar usuário:", erro);
    return { success: false, error: erro };
  }
}

async function buscarUsuarios() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) {
      const err = await resposta.text();
      throw new Error(err || "Falha ao buscar usuários");
    }
    const dados = await resposta.json();
    return dados.documents ?? [];
  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro);
    return [];
  }
}

function mostrarUsuarioNav(usuario) {
  const userInfo = document.getElementById("userInfo");
  const userInfoMobile = document.getElementById("userInfoMobile");
  const loginButton = document.getElementById("openLoginModal");
  const loginButtonMobile = document.getElementById("openLoginModalMobile");

  if (usuario) {
    const texto = `Olá, ${usuario.nome} 👋`;
    if (userInfo) {
      userInfo.textContent = texto;
      userInfo.classList.remove("hidden");
    }
    if (userInfoMobile) {
      userInfoMobile.textContent = texto;
      userInfoMobile.classList.remove("hidden");
    }
    if (loginButton) loginButton.classList.add("hidden");
    if (loginButtonMobile) loginButtonMobile.classList.add("hidden");
    // mostra botão de sair (se ainda não existir, cria)
    addLogoutButton();
  } else {
    if (userInfo) userInfo.classList.add("hidden");
    if (userInfoMobile) userInfoMobile.classList.add("hidden");
    if (loginButton) loginButton.classList.remove("hidden");
    if (loginButtonMobile) loginButtonMobile.classList.remove("hidden");
    removeLogoutButton();
  }
}

function addLogoutButton() {
  const container = document.querySelector(".container.mx-auto") || document.body;
  if (document.getElementById("logoutBtn")) return; // já existe

  // cria botão simples no topo (desktop)
  const btn = document.createElement("button");
  btn.id = "logoutBtn";
  btn.type = "button";
  btn.className = "ml-4 bg-white text-blue-800 font-semibold px-3 py-1 rounded-full shadow hover:bg-blue-100 transition hidden md:inline-block";
  btn.textContent = "Sair";
  btn.addEventListener("click", () => {
    localStorage.removeItem("usuarioLogado");
    mostrarUsuarioNav(null);
    alert("Você saiu da conta.");
  });

  // tenta inserir no header (se achar um local apropriado)
  const navRight = document.querySelector("nav .flex.items-center.justify-between .hidden.md\\:flex.items-center.space-x-6");
  if (navRight) {
    navRight.appendChild(btn);
    btn.classList.remove("hidden");
  } else {
    // fallback: coloca no container
    container.appendChild(btn);
    btn.classList.remove("hidden");
  }

  // mobile - dentro do mobileMenu se existir
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu && !document.getElementById("logoutBtnMobile")) {
    const btnMobile = document.createElement("button");
    btnMobile.id = "logoutBtnMobile";
    btnMobile.type = "button";
    btnMobile.className = "w-full bg-white text-blue-800 font-semibold px-4 py-2 rounded-full shadow mt-2 md:hidden";
    btnMobile.textContent = "Sair";
    btnMobile.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogado");
      mostrarUsuarioNav(null);
      alert("Você saiu da conta.");
    });
    mobileMenu.appendChild(btnMobile);
  }
}

function removeLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (btn) btn.remove();
  const btnMobile = document.getElementById("logoutBtnMobile");
  if (btnMobile) btnMobile.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  // elementos do modal e UI
  const authModal = document.getElementById("authModal");
  const openLoginModal = document.getElementById("openLoginModal");
  const openLoginModalMobile = document.getElementById("openLoginModalMobile");
  const closeLoginModal = document.getElementById("closeLoginModal");

  const loginFormWrapper = document.getElementById("loginForm"); // div que contém o form
  const registerFormWrapper = document.getElementById("registerForm");
  const showRegisterForm = document.getElementById("showRegisterForm");
  const showLoginForm = document.getElementById("showLoginForm");
  const registrationForm = document.getElementById("registrationForm");

  // Seleciona os forms internamente (caso o HTML tenha atributos incorretos)
  const loginFormElement = loginFormWrapper ? loginFormWrapper.querySelector("form") : null;

  // abrir/fechar modal
  if (openLoginModal) openLoginModal.addEventListener("click", () => authModal.classList.remove("hidden"));
  if (openLoginModalMobile) openLoginModalMobile.addEventListener("click", () => authModal.classList.remove("hidden"));
  if (closeLoginModal) closeLoginModal.addEventListener("click", () => authModal.classList.add("hidden"));
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) authModal.classList.add("hidden");
    });
  }

  // alterna entre telas
  if (showRegisterForm) {
    showRegisterForm.addEventListener("click", () => {
      if (loginFormWrapper) loginFormWrapper.classList.add("hidden");
      if (registerFormWrapper) registerFormWrapper.classList.remove("hidden");
    });
  }
  if (showLoginForm) {
    showLoginForm.addEventListener("click", () => {
      if (registerFormWrapper) registerFormWrapper.classList.add("hidden");
      if (loginFormWrapper) loginFormWrapper.classList.remove("hidden");
    });
  }

  // registro
  if (registrationForm) {
    registrationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = (document.getElementById("regNome")?.value || "").trim();
      const email = (document.getElementById("regEmail")?.value || "").trim();
      const cpf = (document.getElementById("regCpf")?.value || "").trim();
      const telefone = (document.getElementById("regTelefone")?.value || "").trim();
      const senha = (document.getElementById("regPassword")?.value || "").trim();
      const confirmarSenha = (document.getElementById("regPasswordConfirm")?.value || "").trim();

      const passwordError = document.getElementById("passwordError");
      if (!senha || senha !== confirmarSenha) {
        if (passwordError) passwordError.classList.remove("hidden");
        return;
      } else {
        if (passwordError) passwordError.classList.add("hidden");
      }

      const resp = await registrarUsuario({ nome, email, cpf, telefone, senha });
      if (resp.success) {
        alert("Conta criada com sucesso! Faça login.");
        registrationForm.reset();
        if (registerFormWrapper) registerFormWrapper.classList.add("hidden");
        if (loginFormWrapper) loginFormWrapper.classList.remove("hidden");
      } else {
        alert("Erro ao criar conta. Verifique o console.");
      }
    });
  }

  // login
  if (loginFormElement) {
    loginFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (document.getElementById("loginEmail")?.value || "").trim();
      const senha = (document.getElementById("loginSenha")?.value || "").trim();
      try {
        const docs = await buscarUsuarios(); // array de documents
        const usuarios = docs.map((doc) => ({
          id: doc.name.split("/").pop(),
          email: doc.fields?.email?.stringValue,
          senha: doc.fields?.senha?.stringValue,
          nome: doc.fields?.nome?.stringValue
        }));

        const usuario = usuarios.find((u) => u.email === email && u.senha === senha);
        if (usuario) {
          localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
          mostrarUsuarioNav(usuario);
          if (authModal) authModal.classList.add("hidden");
          alert(`Bem-vindo(a), ${usuario.nome}!`);
        } else {
          alert("Email ou senha incorretos.");
        }
      } catch (erro) {
        console.error("Erro ao tentar efetuar login:", erro);
        alert("Erro ao conectar com o banco. Veja console.");
      }
    });
  }

  // Mantém usuário logado após recarregar
  try {
    const u = localStorage.getItem("usuarioLogado");
    if (u) {
      const usuario = JSON.parse(u);
      mostrarUsuarioNav(usuario);
    } else {
      mostrarUsuarioNav(null);
    }
  } catch (err) {
    console.error("Erro ao recuperar usuário do localStorage:", err);
    mostrarUsuarioNav(null);
  }
});
// const API_AGENDA = "https://firestore.googleapis.com/v1/projects/tcc-dentista/databases/(default)/documents/agendamento";

// const btnOpen = document.getElementById("btn-agendar");
//   const modal = document.getElementById("modal-agendar");
//   const btnClose = document.getElementById("close-modal");
//   const btnCancel = document.getElementById("btn-cancelar");
//   const form = document.getElementById("form-agendamento");

//   // abrir
//   btnOpen.addEventListener("click", () => modal.classList.remove("hidden"));

//   // fechar
//   btnClose.addEventListener("click", () => modal.classList.add("hidden"));
//   btnCancel.addEventListener("click", () => modal.classList.add("hidden"));

//   // fechar clicando fora
//   modal.addEventListener("click", (e) => {
//     if (e.target === modal) modal.classList.add("hidden");
//   });

//   // envio do formulário
//   form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const dados = {
//       nome: document.getElementById("nome").value,
//       data: document.getElementById("data").value,
//       hora: document.getElementById("hora").value,
//       procedimento: document.getElementById("procedimento").value,
//     };

//     console.log("Agendamento enviado:", dados);

//     alert("Agendamento enviado com sucesso!");
//     form.reset();
//     modal.classList.add("hidden");
//   });
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const dados = {
//     fields: {
//       nome: { stringValue: document.getElementById("nome").value },
//       data: { stringValue: document.getElementById("data").value },
//       hora: { stringValue: document.getElementById("hora").value },
//       procedimento: { stringValue: document.getElementById("procedimento").value },
//     },
//   };

//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(dados),
//     });

//     if (!response.ok) throw new Error("Erro ao salvar!");

//     alert("✅ Agendamento salvo com sucesso!");
//     form.reset();
//     modal.classList.add("hidden");

//   } catch (error) {
//     console.error(error);
//     alert("❌ Erro ao salvar agendamento");
//   }
// });

// const btn = document.getElementById("btn-agendar");
// const modal = document.getElementById("modal-agendar");
// const closeModal = document.getElementById("close-modal");
// const form = document.getElementById("form-agendar");

// btn.addEventListener("click", () => modal.classList.remove("hidden"));
// closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// const API_AGENDA ="https://firestore.googleapis.com/v1/projects/tcc-dentista/databases/(default)/documents/agendamento";

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const dados = {
//     fields: {
//       nome: { stringValue: document.getElementById("nome").value },
//       telefone: { stringValue: document.getElementById("telefone").value },
//       data: { stringValue: document.getElementById("data").value },
//       hora: { stringValue: document.getElementById("hora").value },
//       procedimento: { stringValue: document.getElementById("procedimento").value },
//       status: { stringValue: "pendente" }
//     }
//   };

//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(dados),
//   });

//   const result = await response.json();
//   console.log(result);

//   if (!response.ok) {
//     alert("❌ Erro ao salvar!");
//     return;
//   }

//   alert("✅ Agendamento salvo com sucesso!");
//   form.reset();
//   modal.classList.add("hidden");
// });
document.addEventListener("DOMContentLoaded", () => {
  const btn1 = document.getElementById("btn-agendar");
  const btn2 = document.getElementById("btn-agendar-flutuante");
  const modal = document.getElementById("modal-agendar");
  const closeBtn = document.getElementById("close-modal");
  const cancelarBtn = document.getElementById("btn-cancelar");
  const form = document.getElementById("form-agendamento");

  function abrirModal() {
    modal.classList.remove("hidden");
  }

  function fecharModal() {
    modal.classList.add("hidden");
  }

  if (btn1) btn1.addEventListener("click", abrirModal);
  if (btn2) btn2.addEventListener("click", abrirModal);
  if (closeBtn) closeBtn.addEventListener("click", fecharModal);
  if (cancelarBtn) cancelarBtn.addEventListener("click", fecharModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const data = document.getElementById("data").value;
    const hora = document.getElementById("hora").value;
    const procedimento = document.getElementById("procedimento").value;

    if (!nome || !data || !hora || !procedimento) {
      alert("Preencha todos os campos!");
      return;
    }

    const body = {
      fields: {
        nome: { stringValue: nome },
        data: { stringValue: data },
        hora: { stringValue: hora },
        procedimento: { stringValue: procedimento }
      }
    };

    const resp = await fetch(
      "https://firestore.googleapis.com/v1/projects/tcc-dentista/databases/(default)/documents/agendamento",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    if (resp.ok) {
      alert("Agendamento realizado com sucesso!");
      form.reset();
      fecharModal();
    } else {
      console.error(await resp.text());
      alert("Erro ao salvar no Firebase!");
    }
  });
});
