import fetch from "node-fetch";

export default async function handler(req, res) {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL parametresi eksik." });

    try {
        // Ürün ID'sini URL'den çek
        const match = url.match(/,(\d+)\.html/);
        if (!match) return res.status(400).json({ error: "Ürün ID bulunamadı." });

        const productId = match[1];

        // Akakçe API çağrısı
        const apiUrl = `https://api6.akakce.com/product/${productId}/prices`;

        const response = await fetch(apiUrl, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const data = await response.json();

        // En ucuz fiyatı bul
        const prices = data.result?.products?.[0]?.qvPrices || [];

        res.status(200).json({
            productId,
            prices
        });

    } catch (error) {
        res.status(500).json({ error: "Hata oluştu", detail: error.message });
    }
}
