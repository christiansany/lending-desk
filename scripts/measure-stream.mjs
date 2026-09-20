const target = process.argv[2] ?? "http://localhost:3000/items/item-001";
const startedAt = performance.now();
const response = await fetch(target, { headers: { accept: "text/html" } });

if (!response.body) throw new Error("The response has no readable body.");

const decoder = new TextDecoder();
const observed = new Set();
let responseText = "";

console.log(`${elapsed()} ms  response ${response.status}`);

for await (const chunk of response.body) {
  responseText += decoder.decode(chunk, { stream: true });
  const normalized = responseText.replaceAll('\\"', '"');

  reportMarker(normalized, "fallback", "loading fallback");
  reportMarker(normalized, "item", "first useful item");
  reportMarker(normalized, "availability", "availability");
}

console.log(`${elapsed()} ms  full response`);

function reportMarker(text, marker, label) {
  if (observed.has(marker)) return;
  const htmlAttribute = `data-stream-marker="${marker}"`;
  const serializedProp = `"data-stream-marker":"${marker}"`;
  if (!text.includes(htmlAttribute) && !text.includes(serializedProp)) return;
  observed.add(marker);
  console.log(`${elapsed()} ms  ${label}`);
}

function elapsed() {
  return (performance.now() - startedAt).toFixed(1).padStart(7);
}
