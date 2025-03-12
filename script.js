async function fetchResponseFromAPI(userMessage) {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = "https://5357-2804-d41-c571-5c00-8d30-79ff-7a7e-e2c8.ngrok-free.app/api/v0/chat/completions";

    const fullUrl = proxyUrl + apiUrl;

    const requestBody = {
        model: "granite-3.0-2b-instruct",
        messages: [
            { role: "system", content: "Você é um assistente que sempre responde em português do Brasil." },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
    };

    try {
        const response = await fetch(fullUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "(Erro ao gerar resposta)";
    } catch (error) {
        console.error("❌ Erro ao buscar resposta:", error);
        return "Erro ao processar a mensagem.";
    }
}

// Torna a função acessível para o app.js
window.fetchResponseFromAPI = fetchResponseFromAPI;

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        document.querySelector(".intro-animation").style.display = "none";
    }, 3000); // 🔹 Esconde a vinheta após 3 segundos
});