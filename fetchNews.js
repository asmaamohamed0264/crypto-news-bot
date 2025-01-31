const fetch = require('node-fetch');
const config = require('../config.json');

async function fetchNews() {
    const url = `https://newsapi.org/v2/top-headlines?category=business&apiKey=${config.news_api_key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.articles.slice(0, 2);
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

async function reformulateNews(text) {
    const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.klauster_api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1",
            max_completion_tokens: 500,
            temperature: 1,
            messages: [
                {"role": "system", "content": "Reformulează știrea într-un stil atractiv cu emoji-uri, fără link-uri."},
                {"role": "user", "content": text}
            ]
        })
    });

    const result = await response.json();
    return result.choices[0].message.content;
}

module.exports = { fetchNews, reformulateNews };