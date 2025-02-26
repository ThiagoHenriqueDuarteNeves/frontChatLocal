document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chatLog");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

    // Habilita o botão de enviar quando o usuário digita algo
    promptInput.addEventListener("input", function () {
        sendBtn.disabled = promptInput.value.trim() === "";
    });

    function appendMessage(sender, text, isAssistant = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", isAssistant ? "bot" : "user");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add("avatar");
        avatarDiv.textContent = isAssistant ? "🤖" : "👤";

        const textContainer = document.createElement("div");
        textContainer.classList.add("text");

        const senderElem = document.createElement("span");
        senderElem.classList.add("sender");
        senderElem.textContent = sender + ": ";

        const textElem = document.createElement("span");
        textElem.innerHTML = text;

        textContainer.appendChild(senderElem);
        textContainer.appendChild(textElem);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textContainer);
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    async function sendMessage() {
        const message = promptInput.value.trim();
        if (!message) return;

        appendMessage("Você", message);
        promptInput.value = "";

        // ❌ Desativa o input e o botão enquanto processa a resposta
        promptInput.disabled = true;
        sendBtn.disabled = true;

        // Adiciona a mensagem temporária do bot
        const thinkingMessage = appendMessage("LM Studio", "Pensando...", true);

        // Criando um timeout de erro caso o servidor demore mais de 60 segundos
        const timeout = setTimeout(() => {
            thinkingMessage.querySelector(".text").textContent = "Ops, ocorreu um erro. Poderia me mandar mensagem novamente?";

            // ✅ Reativa o input e o botão após o erro
            promptInput.disabled = false;
            sendBtn.disabled = false;
        }, 60000); // 60 segundos

        try {
            const response = await fetch("https://5357-2804-d41-c571-5c00-8d30-79ff-7a7e-e2c8.ngrok-free.app/api/v0/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "granite-3.0-2b-instruct",
                    messages: [{ role: "user", content: message }],
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false,
                    language: "pt-BR"
                })
            });

            const data = await response.json();

            // Se a resposta chegar a tempo, cancelamos o timeout de erro
            clearTimeout(timeout);

            // Atualiza a mensagem do bot com a resposta real
            thinkingMessage.querySelector(".text").textContent = data.choices[0]?.message?.content || "(Sem resposta)";

        } catch (error) {
            clearTimeout(timeout); // Cancela o timeout se houver um erro antes dos 60s
            thinkingMessage.querySelector(".text").textContent = "Ops, ocorreu um erro. Poderia me mandar mensagem novamente?";
        }

        // Reativa o input e o botão após receber a resposta ou erro
        promptInput.disabled = false;
        sendBtn.disabled = false;
    }

    sendBtn.addEventListener("click", sendMessage);
});
