import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` from writing its own instruction block into AGENTS.md /
  // CLAUDE.md when it detects a coding agent. This workshop keeps the
  // repository free of agent instruction files.
  agentRules: false,
};

export default nextConfig;
