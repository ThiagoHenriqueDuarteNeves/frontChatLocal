document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chatLog");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

    // Mensagem de sistema inicial
    let messageHistory = [
        {
            role: "system",
            content: "Seja um assistente virtual simpatico que fala sempre em portugues" }
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

    // Atualiza o scroll a cada caractere digitado para manter a última mensagem visível
    function typeTextEffect(element, text, speed = 30) {
        let i = 0;
        element.textContent = "";
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                chatLog.scrollTop = chatLog.scrollHeight; // Atualiza o scroll durante a digitação
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
            const response = await fetch("https://c8f79a37c85b.ngrok-free.app/v0/chat/completions", {
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

                // Verifica se o conteúdo contém ``` indicando que é código
                const botCode = botResponse.includes('```') ? botResponse : null;

                // Adiciona a resposta do assistente ao histórico
                messageHistory.push({ role: "assistant", content: botResponse });

                // Limita novamente após adicionar a resposta
                if (messageHistory.length > maxHistoryLength) {
                    messageHistory = messageHistory.slice(-maxHistoryLength);
                }

                // Exibe a resposta de texto do bot com efeito de digitação
                typeTextEffect(botMessageElem, botResponse);

                // Se houver código, exibe na caixa de código
                if (botCode) {
                    const codeBoxContainer = document.querySelector('.code-box');
                    if (codeBoxContainer) {
                        const codeBox = codeBoxContainer.querySelector('code');
                        if (codeBox) {
                            codeBox.textContent = botCode;  // Inserindo o código na caixa de código
                            codeBoxContainer.style.display = 'block';  // Exibe a caixa de código
                        }
                    }
                } else {
                    const codeBoxContainer = document.querySelector('.code-box');
                    if (codeBoxContainer) {
                        codeBoxContainer.style.display = 'none';  // Esconde a caixa de código caso não haja código
                    }
                }

            } else {
                botMessageElem.textContent = "(Erro ao gerar resposta)";
            }
        } catch (error) {
            botMessageElem.textContent = "Erro na resposta. Tente novamente.";
        }

        // Reativa o input e o botão
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
