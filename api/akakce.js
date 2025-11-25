import fetch from "node-fetch";

export default async function handler(req, res) {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({ error: "URL parametresi eksik." });
        }

        // Ürün ID'sini al
        const match = url.match(/,(\d+)\.html/);

        if (!match) {
            return res.status(400).json({ error: "Ürün ID bulunamadı." });
        }

        const productId = match[1];
        const apiUrl = `https://api6.akakce.com/product/${productId}/prices`;

        const response = await fetch(apiUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const text = await response.text();   // önce düz metin alıyoruz

        // JSON mu değil mi kontrol et
        if (!text.startsWith("{")) {
            return res.status(502).json({
                error: "Akakçe JSON döndürmedi",
                returned: text.slice(0, 200) // İlk 200 karakter göster
            });
        }

        const json = JSON.parse(text);

        const prices = json?.result?.products?.[0]?.qvPrices || [];

        return res.status(200).json({
            productId,
            prices
        });

    } catch (err) {
        return res.status(500).json({
            error: "Beklenmeyen hata",
            detail: err.message
        });
    }
}
