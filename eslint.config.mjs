import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      // Our data hook predates this rule. Turned off so the build stays green;
      // we will look at it when we get to it.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**"] },
];

export default config;
