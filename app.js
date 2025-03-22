document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chatLog");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

    // Mensagem de sistema inicial
    let messageHistory = [
        {
            role: "system",
            content: "Voce é um assistente virtual que sempre fala em portugues"}
    ];

    // Define o número máximo de mensagens que serão mantidas no histórico
    const maxHistoryLength = 15;

    function addWelcomeMessage() {
        appendMessage("Gepetudo", "Olá! Sou o Gepetudo, como posso te ajudar hoje?", true, false);
    }

    promptInput.addEventListener("input", function () {
        sendBtn.disabled = promptInput.value.trim() === "";
    });

    function appendMessage(sender, text, isAssistant = false, showTyping = true) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", isAssistant ? "bot" : "user");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");
        avatarDiv.textContent = isAssistant ? "👽" : "👤";

        const textContainer = document.createElement("div");
        textContainer.classList.add("text");

        const senderElem = document.createElement("span");
        senderElem.classList.add("sender");
        senderElem.textContent = sender + ": ";

        const textElem = document.createElement("span");

        // Caso seja mensagem do "assistente" e showTyping = true, mostra "..."
        if (isAssistant && showTyping) {
            textElem.innerHTML = `<span class="typing"></span><span class="typing"></span><span class="typing"></span>`;
        } else {
            textElem.textContent = text;
        }

        textContainer.appendChild(senderElem);
        textContainer.appendChild(textElem);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textContainer);
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;

        return textElem;
    }

    function typeTextEffect(element, text, speed = 30) {
        let i = 0;
        element.textContent = "";
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    async function sendMessage() {
        const message = promptInput.value.trim();
        if (!message) return;

        // Adiciona a mensagem do usuário ao chat
        appendMessage("Você", message);
        messageHistory.push({ role: "user", content: message });

        // Limita o tamanho do histórico antes de enviar à API
        if (messageHistory.length > maxHistoryLength) {
            messageHistory = messageHistory.slice(-maxHistoryLength);
        }

        promptInput.value = "";
        promptInput.disabled = true;
        sendBtn.disabled = true;

        // Exibe placeholder de "Pensando..."
        const botMessageElem = appendMessage("Gepetudo", "Pensando...", true, true);

        try {
            const response = await fetch("https://5a9a-177-69-1-37.ngrok-free.app/api/v0/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "granite-3.0-2b-instruct",
                    messages: messageHistory,  // Usa o histórico limitado
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false,
                    language: "pt-BR"
                })
            });

            const data = await response.json();
            console.log("Resposta do servidor:", data);

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                const botResponse = data.choices[0].message.content;

                // Adiciona a resposta do assistente ao histórico
                messageHistory.push({ role: "assistant", content: botResponse });

                // Limita novamente após adicionar a resposta
                if (messageHistory.length > maxHistoryLength) {
                    messageHistory = messageHistory.slice(-maxHistoryLength);
                }

                // Anima a digitação no elemento
                typeTextEffect(botMessageElem, botResponse);
            } else {
                botMessageElem.textContent = "(Erro ao gerar resposta)";
            }
        } catch (error) {
            botMessageElem.textContent = "Erro na resposta. Tente novamente.";
        }

        // Reativa o input e botão
        promptInput.disabled = false;
        sendBtn.disabled = false;
    }

    sendBtn.addEventListener("click", sendMessage);
    promptInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // Mensagem de boas-vindas
    addWelcomeMessage();
});
