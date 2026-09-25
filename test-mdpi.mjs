import axios from 'axios';

async function run() {
  try {
    const res = await axios.get("https://api.crossref.org/works?query.title=oil%20spill&rows=50&filter=member:1968&select=title,URL,abstract,author,created&sort=published&order=desc&cursor=*&mailto=scraper@example.com", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log("Success! Items:", res.data.message.items.length);
  } catch (e) {
    console.error("Error:", e.message);
    if (e.response) {
      console.error("Response data:", e.response.data);
    }
  }
}

run();
