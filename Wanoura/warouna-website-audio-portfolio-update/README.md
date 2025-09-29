# Warouna Website

This repository contains the source for the **Warouna Website**, designed and written in a legendary, soulful, future-forward brand voice.

## Project Structure

```
warouna-website/
│
├── docs/
│   ├── 01_Warouna_Copy.md        # All website copy (Homepage, About, Services, Portfolio, Contact)
│   ├── 02_Warouna_BrandVoice.md  # Brand voice & tone guidelines
│   └── 03_Warouna_Wireframes.md  # Wireframes & design system
│
├── src/                          # Source code for the website (to be generated)
│   ├── pages/                    # Page components (Next.js/React)
│   ├── components/               # Shared UI components
│   └── styles/                   # TailwindCSS / custom styles
│
└── README.md
```

## Usage in Cursor.ai

When generating code in Cursor, always **anchor prompts** to the docs in `/docs`.

### Example Prompts

- **Homepage Build**
  ```
  Use the copy from docs/01_Warouna_Copy.md (Homepage section).
  Apply typography and colors from docs/03_Warouna_Wireframes.md.
  Generate a responsive Next.js homepage using TailwindCSS.
  ```

- **Navigation Component**
  ```
  Create a navbar using the page structure from docs/03_Warouna_Wireframes.md.
  Keep text labels consistent with docs/01_Warouna_Copy.md.
  ```

- **Voice & Tone Check**
  ```
  Ensure all CTAs and headlines match docs/01_Warouna_Copy.md exactly.
  Follow language style from docs/02_Warouna_BrandVoice.md.
  ```

## Brand Voice Reminder

- **Voice:** Legendary, confident, soulful.  
- **Tone:** Warm, powerful, poetic, precise.  
- **Promise:** We don’t just make music — we shape experiences that last.  

Refer to `02_Warouna_BrandVoice.md` for full guidance.

## Development Notes

- Framework: **Next.js + TailwindCSS**  
- Style: Defined in `03_Warouna_Wireframes.md`  
- Deployment: GitHub Pages or Vercel recommended

---

© 2025 Warouna. All rights reserved.
