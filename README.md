# README Demo Generator

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Open Source](https://img.shields.io/badge/open%20source-yes-111827)

Drop in screenshots, CLI output, or a local app URL, and generate a polished GitHub README with install steps, usage examples, GIF/image slots, and badges.

## Demo

![README Demo Generator screenshot](docs/screenshot.png)

## Features

- Project metadata fields for repo name, tagline, description, license, install command, and usage command
- Screenshot/GIF upload slots that flow into the generated README
- CLI output capture area formatted as markdown
- Local app URL field with a capture note action
- Live GitHub-style README preview
- Copy and download actions for `README.md`

## Installation

```bash
npm install
```

## Usage

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
readme-demo-generator/
├── src/
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Contributing

Issues and pull requests are welcome. Please keep changes focused and include a short explanation of the README workflow you are improving.

## License

MIT
