# Wallicon

A wallpaper generator that creates wallpapers from software icons using [Simple Icons](https://simpleicons.org/) and [tinted-theming](https://github.com/tinted-theming/schemes) base24 color schemes.

![Example of a generated wallpaper with a bunch of software icons visible](/assets/preview.png)

## Features

- **3417+ icons** from [Simple Icons](https://simpleicons.org/)
- **184 themes** from the [tinted-theming/schemes](https://github.com/tinted-theming/schemes) base24 collection
- **5 layout modes**: grid, square-spiral, hex-spiral, hex-symmetric, and arc

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or npm/pnpm/yarn)

### Install

```sh
bun install
```

### Development

```sh
bun run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```sh
bun run build
bun run preview
```

### Code Quality

```sh
bun run check    # TypeScript type checking
bun run lint     # Prettier + ESLint
bun run format   # Format code with Prettier
```

## Deployment

This app is a fully client-side SPA. To deploy to GitHub Pages:

1. Push to the `main` branch — the included GitHub Actions workflow will build and deploy automatically.
2. In your repo settings, go to **Settings → Pages → Source** and select **GitHub Actions**.

## License

[MIT](LICENSE)
