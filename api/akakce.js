import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "URL parametresi eksik." });
    }

    // Ürün ID'sini linkten çıkar
    const match = url.match(/,(\d+)\.html/);
    if (!match) {
      return res.status(400).json({ error: "Ürün ID bulunamadı." });
    }

    const productId = match[1];
    const apiUrl = `https://api6.akakce.com/product/${productId}/prices`;

    const response = await fetch(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const text = await response.text();

    // JSON değilse HTML hatası dönmüştür
    if (!text.startsWith("{")) {
      return res.status(200).json({
        productId,
        prices: [],
        error: "Akakçe JSON yerine HTML döndürdü"
      });
    }

    const json = JSON.parse(text);
    const prices = json?.result?.products?.[0]?.qvPrices || [];

    return res.status(200).json({
      productId,
      prices
    });

  } catch (err) {
    return res.status(200).json({
      error: "Beklenmeyen hata",
      detail: err.message
    });
  }
}
