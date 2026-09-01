import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` from writing its own instruction block into AGENTS.md /
  // CLAUDE.md when it detects a coding agent. We own those files.
  agentRules: false,
};

export default nextConfig;
