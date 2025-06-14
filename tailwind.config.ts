import { color } from "html2canvas/dist/types/css/types/color";
import type { Config } from "tailwindcss";

const config: Config = {
     content: [
          "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
     ],
     theme: {
          extend: {
               color:{
                    primary:"#6366f1"
               },
               fontFamily: {
                    inter: ["var(--font-inter)"],
                    poppins: ["var(--font-poppins)"],
                    roboto: ["var(--font-roboto)"],
               },
          },
     },
     plugins: [require("tailwindcss-animate")],
};

export default config; 