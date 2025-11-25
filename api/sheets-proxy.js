export default async function handler(req, res) {
  try {
    const url = "https://script.google.com/macros/s/AKfycbx6BMwyiZahTPMyEYTO3wnjyP0JEbIRL-wL0y-F55tdgBp7j8uZJdBOCU1_68eDQaNj9Q/exec";

    const googleRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    
    const text = await googleRes.text();

    res.setHeader("Access-Control-Allow-Origin", "*");  
    res.status(200).send(text);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
