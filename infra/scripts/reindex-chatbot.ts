const apiUrl = process.env.CHATBOT_API_URL?.replace(/\/$/, "");
const privateKey = process.env.CHATBOT_PRIVATE_API_KEY;

async function main() {
  if (!apiUrl) throw new Error("CHATBOT_API_URL is required.");
  if (!privateKey) throw new Error("CHATBOT_PRIVATE_API_KEY is required.");

  const response = await fetch(`${apiUrl}/chat/reindex`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": privateKey,
    },
    body: JSON.stringify({}),
  });

  const text = await response.text();

  let payload: unknown = text;
  try {
    payload = JSON.parse(text);
  } catch {}

  if (!response.ok) {
    console.error(payload);
    throw new Error(`Reindex failed with HTTP ${response.status}`);
  }

  console.log("Chatbot reindex completed.");
  console.log(payload);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
