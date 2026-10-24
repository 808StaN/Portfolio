# Website Fonts

- **Satoshi Variable**, normal, weights 300-900: display headings. Obtained from [Fontshare](https://www.fontshare.com/fonts/satoshi), licensed under ITF FFL 2.0. See `Satoshi-LICENSE.txt`.
- **Geist**, normal, weights 100-900: body copy and UI. Latin and Latin Extended subsets obtained from [Google Fonts](https://fonts.google.com/specimen/Geist), licensed under SIL OFL 1.1. See `Geist-OFL.txt`.

Both families include Polish characters. Fonts are served locally; visitors do not contact Fontshare or Google Fonts.

## Satoshi Setup

The Satoshi license permits self-hosting on the licensee's own website but restricts redistribution through repositories. Its binary is therefore gitignored. `npm run dev` and `npm run build` download the official, unmodified WOFF2 when it is missing. Later runs reuse the local file. A fresh checkout or deployment build needs network access for this first download.

Downloading and using Satoshi is subject to the included Fontshare license. If the automated download is unavailable, obtain the family directly from Fontshare and use the unmodified `Satoshi-Variable.woff2` from its WOFF2 folder as `public/fonts/satoshi-variable.woff2`.
