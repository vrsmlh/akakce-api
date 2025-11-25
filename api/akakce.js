import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL eksik" });

    // Sayfanın kendisini çek
    const html = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    }).then(r => r.text());

    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
    let offers = [];
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);

        // 1) offers.offers[]
        if (data?.offers?.offers) {
          data.offers.offers.forEach(o => {
            if (o.price && o.seller?.name) {
              offers.push({
                seller: o.seller.name,
                price: o.price
              });
            }
          });
        }

        // 2) offers[] (bazı ürünlerde)
        if (Array.isArray(data?.offers)) {
          data.offers.forEach(o => {
            if (o.price && o.seller?.name) {
              offers.push({
                seller: o.seller.name,
                price: o.price
              });
            }
          });
        }

      } catch (e) {
        // JSON-LD parse hatası varsa geç
      }
    }

    return res.status(200).json({
      found: offers.length,
      offers: offers
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
