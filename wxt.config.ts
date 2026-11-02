import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: ({ browser }) => ({
    name: "Dummio",
    description: "Fill any web form with realistic fake data in one click.",
    permissions: ["activeTab", "scripting", "contextMenus", "storage"],
    commands: {
      "fill-page": {
        suggested_key: { default: "Alt+Shift+F" },
        description: "Fill every field on the page",
      },
    },
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "dummio@melvinbulan17.github.io",
          strict_min_version: "140.0",
          data_collection_permissions: { required: ["none"] },
        },
      },
    }),
  }),
  zip: {
    excludeSources: ["PRODUCT.md", "docs/**"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
