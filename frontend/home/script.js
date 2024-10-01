function logar() {
    var login = document.getElementById('login').value;
    var senha = document.getElementById('senha').value;

    if (login == "lucas.lira" && senha == "cEk7Nuv9") {
        // Armazena o estado de login no localStorage
        localStorage.setItem('usuarioLogado', 'true');

        // Armazena a hora do login (em milissegundos desde 1970)
        localStorage.setItem('horaLogin', Date.now());

        // Redireciona para a página inicial
        location.href = "../index.html";
    } else {
        alert('Usuário ou senha incorretos');
    }
}