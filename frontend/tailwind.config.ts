// tailwind.config.ts

import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1.5rem",
        },
      },
      // --- ADD/MODIFY THIS SECTION TO CUSTOMIZE TYPOGRAPHY HEADINGS ---
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Ensure main text is dark (as we did previously)
            color: theme('colors.gray.900'),

            // --- Explicitly set heading colors for light mode ---
            'h1, h2, h3, h4, h5, h6': {
              color: theme('colors.gray.900'), // Make all headings very dark
              // You can also adjust font-weight if they are too thin
              // fontWeight: '700', // Example: make them bold
            },
            // If the dates are rendered as <strong> or <b> tags:
            'strong': {
              color: theme('colors.gray.900'), // Make bold text very dark
            },
            // If they are list items that prose makes light, you might need to inspect
            // the rendered HTML to see what tag they are.
            // li: {
            //   color: theme('colors.gray.900'),
            // },

            // --- Adjust colors for dark mode if you use it ---
            // (Only if your dark mode background is dark and you want light text on it)
            // If you have dark mode enabled, 'dark:prose-invert' will use 'invert' colors
            // So, ensure your 'invert' config has appropriate colors for headings on dark backgrounds.
            // If your issue is light-on-light, you are likely in light mode.
          },
        },
        // If you have a dark mode, you might also customize 'invert' colors here
        // invert: {
        //   css: {
        //     'h1, h2, h3, h4, h5, h6': {
        //       color: theme('colors.gray.100'), // Example: light gray for headings in dark mode
        //     },
        //     strong: {
        //       color: theme('colors.gray.100'),
        //     },
        //   },
        // },
      }),
      // --- END TYPOGRAPHY CUSTOMIZATION ---
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;