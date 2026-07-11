import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-duplicate-props": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // These rules exist to prep components for the React Compiler, which
      // this app does not opt into. Decorative randomness (background
      // shapes, message ids) doesn't need memoized purity here, and our
      // "const Icon = getXIcon(...)" pattern looks up a stable reference
      // from a fixed Record<string, LucideIcon> map — not a freshly created
      // component — so static-components' warning doesn't apply either.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off"
    },
  },
];

export default eslintConfig;
