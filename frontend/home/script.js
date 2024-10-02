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
    } else if (login == "sandrielle.almeida" && senha == "WHS@2024") {
        usuario = "Sandrielle Almeida";
    } else if (login == "anderson.brito" && senha == "WHS@2024") {
        usuario = "Anderson Brito";
    } else if (login == "ivo.vieira" && senha == "WHS@2024") {
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
