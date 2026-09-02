const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

let input;
try {
  input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
} catch {
  console.log(
    JSON.stringify({
      permissionDecision: "deny",
      permissionDecisionReason: "Safety hook could not read the requested shell command.",
    }),
  );
  process.exitCode = 0;
}

if (input) {
  const command = collectStrings(input.toolArgs ?? input.tool_input).join("\n");
  const destructivePatterns = [
    /\bgit\s+reset\s+--hard\b/i,
    /\bgit\s+checkout\s+--\b/i,
    /\bgit\s+restore\b/i,
    /\bgit\s+clean\b[^;&|]*\s-[a-z]*f/i,
    /\bgit\s+push\b[^;&|]*\s+--force(?:-with-lease)?\b/i,
    /\brm\s+-[a-z]*r[a-z]*f[a-z]*\s+(?:\/|~|\.{1,2}|[*])(?:\s|$)/i,
  ];
  const blocked = destructivePatterns.some((pattern) => pattern.test(command));

  console.log(
    JSON.stringify(
      blocked
        ? {
            permissionDecision: "deny",
            permissionDecisionReason:
              "This command can discard uncommitted work or rewrite history. Use a targeted, reversible alternative.",
          }
        : { permissionDecision: "allow" },
    ),
  );
}
