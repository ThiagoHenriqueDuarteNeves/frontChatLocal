// app.js
// Utilizamos o padrão de módulos (IIFE) para melhorar a organização do código

// Módulo de Conexão: Gerencia a verificação do status do servidor LM Studio
const ConnectionModule = (() => {
    const connectionIcon = document.getElementById("connectionIcon");
    const connectionText = document.getElementById("connectionText");
    let serverURL = "";
    let checkConnectionInterval = null;
  
    async function checkConnection() {
      try {
        const response = await fetch(`http://${serverURL}/api/v0/models`);
        if (response.ok) {
          connectionIcon.style.backgroundColor = "green";
          connectionText.textContent = "conectado";
        } else {
          connectionIcon.style.backgroundColor = "red";
          connectionText.textContent = "desconectado";
        }
      } catch (error) {
        connectionIcon.style.backgroundColor = "red";
        connectionText.textContent = "desconectado";
      }
    }
  
    function startChecking(url) {
      serverURL = url;
      checkConnection();
      checkConnectionInterval = setInterval(checkConnection, 5000);
    }
  
    function getServerURL() {
      return serverURL;
    }
  
    return { startChecking, getServerURL };
  })();
  
  // Módulo de Formatação: Trata a formatação do texto do assistente
  const FormattingModule = (() => {
    function removeThinkLines(text) {
      return text.replace(/^Think:.*$/gm, "").trim();
    }
  
    function formatAsParagraphs(text) {
      const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
      return paragraphs.map(par => `<p>${par}</p>`).join("");
    }
  
    function formatAssistantText(text) {
      let formatted = removeThinkLines(text);
      formatted = formatAsParagraphs(formatted);
      return formatted;
    }
  
    return { formatAssistantText };
  })();
  
  // Módulo de Chat: Gerencia o envio de mensagens e a exibição do chat
  const ChatModule = (() => {
    const chatLog = document.getElementById("chatLog");
    let messages = [
      { role: "system", content: "Você é um assistente amigável que responde de forma útil." }
    ];
  
    function appendMessage(sender, text, isAssistant = false) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
  
      const senderElem = document.createElement("span");
      senderElem.classList.add("sender");
      senderElem.textContent = sender + ":";
  
      const textElem = document.createElement("span");
      if (isAssistant) {
        textElem.innerHTML = FormattingModule.formatAssistantText(text);
      } else {
        textElem.textContent = text;
      }
  
      messageDiv.appendChild(senderElem);
      messageDiv.appendChild(textElem);
      chatLog.appendChild(messageDiv);
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  
    async function sendMessage(message) {
      messages.push({ role: "user", content: message });
      appendMessage("Você", message);
  
      const payload = {
        model: "granite-3.0-2b-instruct",
        messages: messages,
        temperature: 0.7,
        max_tokens: -1,
        stream: false,
      };
  
      try {
        const response = await fetch(`http://${ConnectionModule.getServerURL()}/api/v0/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
          throw new Error("Erro na requisição: " + response.status);
        }
        const data = await response.json();
        const reply = data.choices[0].message.content;
        appendMessage("LM Studio", reply, true);
        messages.push({ role: "assistant", content: reply });
      } catch (error) {
        console.error(error);
        appendMessage("Erro", error.message);
      }
    }
  
    return { sendMessage };
  })();
  
  // Módulo de Inicialização da Aplicação: Gerencia a transição entre telas e eventos
  const AppModule = (() => {
    const setupScreen = document.getElementById("setupScreen");
    const chatScreen = document.getElementById("chatScreen");
    const ipInput = document.getElementById("ipInput");
    const connectBtn = document.getElementById("connectBtn");
    const promptInput = document.getElementById("prompt");
    const sendBtn = document.getElementById("sendBtn");
  
    function init() {
      connectBtn.addEventListener("click", () => {
        const ipValue = ipInput.value.trim();
        if (ipValue) {
          ConnectionModule.startChecking(ipValue);
          showChatScreen();
        }
      });
  
      sendBtn.addEventListener("click", () => {
        const text = promptInput.value.trim();
        if (text) {
          ChatModule.sendMessage(text);
          promptInput.value = "";
        }
      });
  
      promptInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          sendBtn.click();
        }
      });
    }
  
    function showChatScreen() {
      setupScreen.style.display = "none";
      chatScreen.style.display = "flex";
      chatScreen.style.flexDirection = "column";
    }
  
    return { init };
  })();
  
  // Inicializa a aplicação
  AppModule.init();
  