function sendMessage() {
    const inputField = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const messageText = inputField.value.trim();

    if (messageText === "") return;

    // Criar mensagem do usuário
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user");
    userMessage.innerHTML = `<div class="avatar">👤</div><div class="text">${messageText}</div>`;
    chatBox.appendChild(userMessage);

    // Simular resposta do bot
    setTimeout(() => {
        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot");
        botMessage.innerHTML = `<div class="avatar">🤖</div><div class="text">Ainda estou aprendendo a responder!</div>`;
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);

    // Limpar input e rolar para baixo
    inputField.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}
