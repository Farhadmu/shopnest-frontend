# Tailwind CSS v4 Installation & Setup Guide

To ensure that Tailwind CSS v4 compiles correctly with Next.js and PostCSS, verify that the following dependencies are installed in your project.

## 1. Required Packages

Run the following command in your terminal to install the necessary packages as development dependencies:

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

### What these packages do:
*   **`tailwindcss`**: The core Tailwind CSS v4 library.
*   **`@tailwindcss/postcss`**: The official PostCSS plugin for Tailwind CSS v4, which integrates with Next.js's build system.
*   **`postcss`**: The underlying CSS compiler required to run PostCSS plugins like `@tailwindcss/postcss`.

---

## 2. Configuration Files

Ensure your project contains the following configuration:

### PostCSS Configuration (`postcss.config.mjs`)
Located at the root of your project:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Global Styles (`src/app/globals.css`)
Tailwind CSS v4 is initialized and customized directly in your main CSS file:

```css
@import "tailwindcss";

@theme {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  
  --font-sans: var(--font-sans);
  
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);

  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
}
```

---

## 3. Running and Troubleshooting

### Dev Server Restart
Next.js Turbopack dev server caches CSS compilation and configuration files aggressively. After installing the packages:

1. Stop your running dev server (`Ctrl + C`).
2. Restart it:
   ```bash
   npm run dev
   ```

### Clearing Next.js Build Cache
If the styles are still not resolving, clear the local build cache:

```bash
# Delete the .next cache folder
rm -rf .next
# Restart dev server
npm run dev
```
