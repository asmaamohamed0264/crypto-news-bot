const fetch = require('node-fetch');
const { fetchNews, reformulateNews } = require('./fetchNews');
const config = require('../config.json');

async function generateImage(prompt) {
    const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.klauster_api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1",
            max_completion_tokens: 100,
            messages: [
                {"role": "user", "content": `Generează o imagine descriptivă pentru această știre: ${prompt}`}
            ]
        })
    });

    const result = await response.json();
    return result.choices[0].message.content;
}

async function sendToTelegram(imageUrl, text) {
    const url = `https://api.telegram.org/bot${config.telegram_bot_token}/sendPhoto`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: config.telegram_chat_id,
            photo: imageUrl,
            caption: text,
            parse_mode: 'Markdown'
        }),
    });
}

async function main() {
    const news = await fetchNews();
    if (news.length > 0) {
        for (let article of news) {
            const refinedText = await reformulateNews(article.title);
            const imageUrl = await generateImage(refinedText);
            await sendToTelegram(imageUrl, refinedText);
        }
        console.log('Știrile au fost postate pe Telegram!');
    } else {
        console.log('Nu s-au găsit știri.');
    }
}

main();