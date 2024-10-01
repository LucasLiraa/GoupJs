window.onload = function() {
    var usuarioLogado = localStorage.getItem('usuarioLogado');
    var horaLogin = localStorage.getItem('horaLogin');
    var tempoMaximo = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

    if (usuarioLogado !== 'true' || !horaLogin) {
        // Se não estiver logado ou não houver hora de login, redireciona para a página de login
        window.location.href = "./home/index.html";
    } else {
        var agora = Date.now();

        // Verifica se o tempo desde o login ultrapassou o tempo máximo permitido
        if (agora - horaLogin > tempoMaximo) {
            alert('Sessão expirada, faça login novamente.');

            // Remove o estado de login e redireciona para a página de login
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('horaLogin');
            window.location.href = "./home/index.html";
        }
    }
};
function logout() {
    // Remove o estado de login e a hora do login do localStorage
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('horaLogin');

    // Redireciona para a página de login
    window.location.href = "./home/index.html";  // ajuste o caminho conforme necessário
}

const body = document.querySelector("body"),
      sidebar = body.querySelector(".sideMenu"),
      toggle = body.querySelector(".toggle"),
      searchBtn = body.querySelector(".sideMenuSearch"),
      modeSwtich = body.querySelector(".sideMenuToggle"),
      modeText = body.querySelector(".sideMenuModeText");

toggle.addEventListener("click", () =>{
    sidebar.classList.toggle("close");
});

modeSwtich.addEventListener("click", () =>{
    body.classList.toggle("dark");

    if(body.classList.contains("dark")){
        modeText.innerText = "Light Mode"
    } else {
        modeText.innerText = "Dark Mode"
    }
});