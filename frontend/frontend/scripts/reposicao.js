document.addEventListener("DOMContentLoaded", function() {
    const body = document.querySelector("body"),
          sidebar = body.querySelector(".sideMenu"),
          toggle = body.querySelector(".toggle"),
          modeSwitch = body.querySelector(".sideMenuToggle"),
          modeText = body.querySelector(".sideMenuModeText");

    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });

    modeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");

        if (body.classList.contains("dark")) {
            modeText.innerText = "Light Mode";
        } else {
            modeText.innerText = "Dark Mode";
        }

        updateChartColors();
    })
});


// Abrir o formulário quando clicar no botão "Administrar Cotações"
document.querySelector('.reposControlButton button').addEventListener('click', function() {
    document.querySelector('.sectionReposForms').style.display = 'flex';
  });
  
  // Fechar o formulário quando clicar no botão de fechar
  document.querySelector('.closeFormButton').addEventListener('click', function() {
    document.querySelector('.sectionReposForms').style.display = 'none';
  });
  