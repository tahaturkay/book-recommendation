// Ben karşılaştırmak adına 2 tane yapay zekayı Hakim yaptım
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * @param {string} userTastes  kullanıcının sevdiği, sevmediği ve nötr olduğu; türler ve yazarlar
 * @param {object} recommendation AI'ın ürettiği kitap önerisi
 * @returns {object}  puan 1 ve 10 arasında
 */
async function evaluateRecommendationGROQ(userTastes, recommendation) {
    // ai yargıçlara verilcek prompt
    const prompt = `
        Sen acımasız ve tarafsız bir kitap eleştirmenisin. Görevin, bir yapay zeka sahafının yaptığı kitap önerisini değerlendirmektir.
        
        KULLANICI PROFİLİ:
        ${userTastes}
        
        YAPILAN ÖNERİ:
        Kitap Adı: ${recommendation.title}
        Yazar: ${recommendation.author}
        
        GÖREV:
        1. Bu kitap, kullanıcının profiline ne kadar uygun?
        2. Bu öneriye 1 ile 10 arasında bir kalite puanı ver. (1: Berbat, 10: Mükemmel)

        Cevabını SADECE aşağıdaki JSON formatında ver, başka metin ekleme:
        {
            "critique": "Hakem olarak bu öneriyi neden beğendiğin veya beğenmediğin hakkında kısa bir yorum.",
            "score": [1-10 arası bir sayı]
        }
    `;

    try {
        // yine groqun reasoning için olan bi yz'sini kullanıyorum
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-20b", 
            reasoning_effort: "high", // fena kafa patlatsın
            temperature: 0.6, // biraz daha kararlı cevap
            response_format: { type: "json_object" }
        });

        let aiText = chatCompletion.choices[0]?.message?.content || "{}";
        return JSON.parse(aiText);
    } catch (error) {
        console.error("Bizim degerlendirme isi vardi ya, o yok artik:", error);
        return null;
    }
}

async function evaluateRecommendationGEMINI(userTastes, recommendation) {
    const prompt = `
        Sen acımasız ve tarafsız bir kitap eleştirmenisin. Görevin, bir yapay zeka sahafının yaptığı kitap önerisini değerlendirmektir.
        
        KULLANICI PROFİLİ:
        ${userTastes}
        
        YAPILAN ÖNERİ:
        Kitap Adı: ${recommendation.title}
        Yazar: ${recommendation.author}

        GÖREV:
        1. Bu kitap, kullanıcının profiline ne kadar uygun?
        2. Bu öneriye 1 ile 10 arasında bir kalite puanı ver. (1: Berbat, 10: Mükemmel)

        Cevabını SADECE aşağıdaki JSON formatında ver, başka metin ekleme:
        {
            "critique": "Hakem olarak bu öneriyi neden beğendiğin veya beğenmediğin hakkında kısa bir yorum.",
            "score": [1-10 arası bir sayı]
        }
    `;

    try {
        const chatCompletion = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite", // buna max 15 req girdiğinden backendi de 15e çektim mecbur şuan 40(şartı sağlayan kitap)-15(önerilen kitap)
            contents: prompt,
            config: {
                temperature: 0.1, // baya kararlı cevap
                responseMimeType: "application/json" // json cevap istiyorumm
            }
        });

        let aiText = chatCompletion.text || "{}";    
        return JSON.parse(aiText);
    } catch (error) {
        console.error("Abe degerlendiremedim abe:", error);
        return null;
    }
}

module.exports = { evaluateRecommendationGROQ, evaluateRecommendationGEMINI };