import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();

app.get("/api/akakce", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "URL parametresi eksik." });

    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        const productName = $("h1").first().text().trim();
        let sellers = [];

        $(".pt_v8, .pn_v8, .v_v8").each((i, el) => {
            const priceText = $(el).text().trim();
            const priceMatch = priceText.match(/[\d,.]+/);
            if (priceMatch) {
                sellers.push({ seller: "Satıcı " + (i + 1), price: priceMatch[0] });
            }
        });

        const sorted = sellers.sort((a, b) =>
            parseFloat(a.price.replace(",", ".")) - parseFloat(b.price.replace(",", "."))
        );

        res.json({
            product: productName,
            sellers: sorted,
            cheapest: sorted[0]
        });

    } catch (error) {
        res.status(500).json({ error: "Hata oluştu", detail: error.message });
    }
});

export default app;
