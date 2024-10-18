import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "http://emgi.co.in",
  integrations: [
    mdx({
      rehypePlugins: [rehypeKatex],
      remarkPlugins: [remarkMath],
    }),
    sitemap(),
    react(),
  ],
});
