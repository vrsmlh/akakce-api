import fetch from "node-fetch";

export default async function handler(req, res) {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({ error: "URL parametresi eksik." });
        }

        // Akakçe ürün ID'sini URL'den al
        const match = url.match(/,(\d+)\.html/);

        if (!match) {
            return res.status(400).json({ error: "Ürün ID bulunamadı." });
        }

        const productId = match[1];

        // Akakçe'nin kendi JSON API'si
        const apiUrl = `https://api6.akakce.com/product/${productId}/prices`;

        const response = await fetch(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const json = await response.json();

        // Fiyat listesi JSON içinden geliyor
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
