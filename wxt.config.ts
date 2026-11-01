import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Dummio",
    description: "Fill any web form with realistic fake data in one click.",
    permissions: ["activeTab", "scripting", "contextMenus", "storage"],
    commands: {
      "fill-page": {
        suggested_key: { default: "Alt+Shift+F" },
        description: "Fill every field on the page",
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
