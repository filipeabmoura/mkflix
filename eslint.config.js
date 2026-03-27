const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/.angular/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/prisma/migrations/**"
    ]
  }
];
