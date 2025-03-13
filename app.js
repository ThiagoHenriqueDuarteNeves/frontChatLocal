document.addEventListener("DOMContentLoaded", function () {
    const chatLog = document.getElementById("chatLog");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");

    function addWelcomeMessage() {
        appendMessage("LM Studio", "Olá! Sou o Gepetudo, como posso te ajudar hoje?", true, false);
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

        appendMessage("Você", message);
        promptInput.value = "";
        promptInput.disabled = true;
        sendBtn.disabled = true;

        const botMessageElem = appendMessage("LM Studio", "Pensando...", true, true);

        try {
            const response = await fetch("https://e8b7-2804-d41-c571-5c00-d175-a3d1-93a8-67b5.ngrok-free.app/api/v0/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "granite-3.0-2b-instruct",
                    messages: [
                        { role: "system", content: "Você é um assistente que sempre responde em português do Brasil." },
                        { role: "user", content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: -1,
                    stream: false,
                    language: "pt-BR"
                })
            });

            const data = await response.json();
            console.log("Resposta do servidor:", data);

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                typeTextEffect(botMessageElem, data.choices[0].message.content);
            } else {
                botMessageElem.textContent = "(Erro ao gerar resposta)";
            }
        } catch (error) {
            botMessageElem.textContent = "Erro na resposta. Tente novamente.";
        }

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

    addWelcomeMessage();
});
