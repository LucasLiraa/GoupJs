document.addEventListener('DOMContentLoaded', () => {
    // Função para abrir o formulário
    function abrirForm() {
      document.querySelector('.sectionReposForms').style.display = 'block';
    }

    // Função para fechar o formulário
    function fecharForm() {
      document.querySelector('.sectionReposForms').style.display = 'none';
    }

    // Event Listener para o botão de fechar
    const closeButton = document.querySelector('.closeFormButton');
    if (closeButton) {
      closeButton.addEventListener('click', fecharForm);
    }

    // Exemplo de como abrir o formulário, você pode adicionar este evento a um botão ou outro elemento
    const openButton = document.querySelector('.algumBotaoParaAbrir'); // Substitua pelo seletor do seu botão
    if (openButton) {
      openButton.addEventListener('click', abrirForm);
    }
  });