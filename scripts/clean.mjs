import { rm } from "node:fs/promises";

const generatedNextDirectory = new URL("../.next/", import.meta.url);

await rm(generatedNextDirectory, { recursive: true, force: true });
console.log("Removed generated .next output.");
