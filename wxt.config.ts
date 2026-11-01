import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Dummio",
    description: "Fill any web form with realistic fake data in one click.",
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
