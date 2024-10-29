function logar() {
    var login = document.getElementById('login').value;
    var senha = document.getElementById('senha').value;
    var usuario = "";

    if (login == "administrador" && senha == "infra@estoque") {
        usuario = "Administrador";
    } else if (login == "lucas.lira" && senha == "cEk7Nuv9") {
        usuario = "Lucas Lira";
    } else if (login == "juliele.carvalho" && senha == "WHS@2024") {
        usuario = "Juliele Carvalho";
    } else if (login == "sandrielle.almeida" && senha == "TI@suporte2") {
        usuario = "Sandrielle Almeida";
    } else if (login == "anderson.brito" && senha == "infra@estoque") {
        usuario = "Anderson Brito";
    } else if (login == "ivo.vieira" && senha == "infra@estoque") {
        usuario = "Ivo Vieira";
    } else {
        alert('Usuário ou senha incorretos');
        return; // Sai da função se o login falhar
    }

    // Armazena o estado de login no localStorage
    localStorage.setItem('usuarioLogado', 'true');
    localStorage.setItem('nomeUsuario', usuario);

    // Armazena a hora do login (em milissegundos desde 1970)
    localStorage.setItem('horaLogin', Date.now());

    // Redireciona para a página inicial
    location.href = "../index.html";
}

const togglePassword = document.querySelector('#togglePassword');
const passwordField = document.querySelector('#senha');
const icon = togglePassword.querySelector('i');

togglePassword.addEventListener('click', function () {
    // Alterna o tipo do input entre 'password' e 'text'
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    // Alterna o ícone entre 'fa-eye' e 'fa-eye-slash'
    icon.classList.toggle('fa-eye-slash');
    icon.classList.toggle('fa-eye');
});
