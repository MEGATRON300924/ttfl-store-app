const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  globalIgnores(["node_modules/**", ".expo/**", "dist/**"]),
  expoConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
