import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL parametresi eksik." });

    // Sayfa HTML'ini çek
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await response.text();

    // JSON-LD veri bloklarını ayıkla
    const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

    let offers = [];

    for (let block of jsonBlocks) {
      try {
        const data = JSON.parse(block[1]);

        // Offer listesi ürünlerde "offers" altında olur
        if (data.offers && Array.isArray(data.offers)) {
          data.offers.forEach(o => {
            if (o.price && o.seller?.name) {
              offers.push({
                seller: o.seller.name,
                price: o.price
              });
            }
          });
        }

        // Bazı ürünlerde "aggregateOffer" altında olabilir
        if (data.offers?.offers && Array.isArray(data.offers.offers)) {
          data.offers.offers.forEach(o => {
            if (o.price && o.seller?.name) {
              offers.push({
                seller: o.seller.name,
                price: o.price
              });
            }
          });
        }

      } catch (e) {
        continue;
      }
    }

    return res.status(200).json({
      offers: offers,
      found: offers.length
    });

  } catch (err) {
    return res.status(500).json({
      error: "Beklenmeyen hata",
      detail: err.message
    });
  }
}
