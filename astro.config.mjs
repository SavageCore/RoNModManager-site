// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
// Site: https://savagecore.github.io/RoNModManager-site/
export default defineConfig({
  site: "https://savagecore.github.io",
  base: "/RoNModManager-site",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "RoN Mod Manager",
      description:
        "Homepage and documentation for RoN Mod Manager, a Ready or Not mod manager for Windows and Linux.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/SavageCore/RoNModManager",
        },
      ],
      sidebar: [
        { label: "Docs", slug: "docs" },
        {
          label: "Getting started",
          items: [
            { label: "Getting started", slug: "docs/getting-started" },
            { label: "Install on Windows", slug: "docs/installation/windows" },
            { label: "Install on Linux", slug: "docs/installation/linux" },
            {
              label: "Install with Flatpak",
              slug: "docs/installation/flatpak",
            },
          ],
        },
        {
          label: "Using the app",
          items: [
            { label: "Mod sources", slug: "docs/mod-sources" },
            {
              label: "Profiles and collections",
              slug: "docs/profiles-and-collections",
            },
            { label: "Hosting modpacks", slug: "docs/modpacks/hosting" },
            { label: "Browser userscript", slug: "docs/userscript" },
          ],
        },
        { label: "Troubleshooting", slug: "docs/troubleshooting" },
      ],
      editLink: {
        baseUrl:
          "https://github.com/SavageCore/RoNModManager-site/edit/main/src/content/docs/",
      },
      customCss: ["./src/styles/tokens.css", "./src/styles/docs.css"],
    }),
  ],
});
