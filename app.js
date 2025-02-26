document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chatLog");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

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
        textElem.textContent = text; //Exibe "Pensando..." ao criar a mensagem
    
        textContainer.appendChild(senderElem);
        textContainer.appendChild(textElem);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(textContainer);
        chatLog.appendChild(messageDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
<<<<<<< HEAD
    
        return textElem; //Retorna o elemento onde o texto será atualizado
    }
    

    function typeTextEffect(element, text, speed = 10) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
=======

        return messageDiv; // 🔥 Retorna o elemento para ser atualizado depois 🔥
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce
    }

    async function sendMessage() {
        const message = promptInput.value.trim();
        if (!message) return;

        appendMessage("Você", message);
        promptInput.value = "";

        promptInput.disabled = true;
        sendBtn.disabled = true;

        // Exibe "Pensando..." antes da resposta
        const botMessageElem = appendMessage("LM Studio", "Pensando...", true);

        const timeout = setTimeout(() => {
            botMessageElem.textContent = "Ops, ocorreu um erro. Poderia me mandar mensagem novamente?";
            promptInput.disabled = false;
            sendBtn.disabled = false;
        }, 60000);

        try {
            const response = await fetch("https://5357-2804-d41-c571-5c00-8d30-79ff-7a7e-e2c8.ngrok-free.app/api/v0/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "granite-3.0-2b-instruct",
                    messages: [
<<<<<<< HEAD
                        { role: "system", content: "Você é um assistente que sempre responde em português do Brasil." },
=======
                        { role: "system", content: "Você é um assistente que sempre responde em português do Brasil." }, // 🔥 Garante que o bot responde em PT-BR
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce
                        { role: "user", content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false,
                    language: "pt-BR"
                })
            });

            const data = await response.json();
<<<<<<< HEAD
            console.log("Resposta do servidor:", data);
=======
            console.log("Resposta do servidor:", data); // 🔍 Debug: veja a resposta no console
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce

            clearTimeout(timeout);

<<<<<<< HEAD
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                botMessageElem.textContent = ""; // Limpa "Pensando..."
                typeTextEffect(botMessageElem, data.choices[0].message.content); // Efeito de digitação
            } else {
                botMessageElem.textContent = "(Sem resposta)";
=======
            // Atualiza a mensagem do bot com a resposta real
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                thinkingMessage.querySelector(".text").textContent = data.choices[0].message.content;
            } else {
                thinkingMessage.querySelector(".text").textContent = "(Sem resposta)";
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce
            }

        } catch (error) {
            console.error("Erro ao buscar resposta:", error);
<<<<<<< HEAD
            clearTimeout(timeout);
            botMessageElem.textContent = "Ops, ocorreu um erro. Poderia me mandar mensagem novamente?";
=======
            clearTimeout(timeout); // Cancela o timeout se houver um erro antes dos 60s
            thinkingMessage.querySelector(".text").textContent = "Ops, ocorreu um erro. Poderia me mandar mensagem novamente?";
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce
        }

        promptInput.disabled = false;
        sendBtn.disabled = false;
    }

    sendBtn.addEventListener("click", sendMessage);

<<<<<<< HEAD
    promptInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
=======
    // Permitir envio com a tecla Enter
    promptInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Evita quebra de linha
>>>>>>> 096dfc740bba85de43b8ac1978c3608751f60cce
            sendMessage();
        }
    });
});
