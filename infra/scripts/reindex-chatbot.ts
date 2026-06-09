const baseUrl = process.env.CHATBOT_API_URL ?? "http://localhost:4100";
const apiKey = process.env.CHATBOT_PRIVATE_API_KEY;

if (!apiKey) {
  console.error("CHATBOT_PRIVATE_API_KEY is required");
  process.exit(1);
}

const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/reindex`, {
  method: "POST",
  headers: { "x-api-key": apiKey },
});

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

console.log(await response.json());
