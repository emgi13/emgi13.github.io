# Project Overview

This is a portfolio website for EmGiCO. It is built using [AstroJS](https://astro.build/), a modern static site generator for JavaScript. The website features a blog with articles on various technical topics, as well as interactive graphics and visualizations.

## Key Technologies

*   **Framework:** [AstroJS](https://astro.build/)
*   **UI Components:** [React](https://react.dev/)
*   **Styling:** [SASS](https://sass-lang.com/)
*   **Package Manager:** [Bun](https://bun.sh/)
*   **Content:** [MDX](https://mdxjs.com/)
*   **Interactive Graphics:** [p5.js](https://p5js.org/)
*   **3D Logo:** [AtroposJS](https://atroposjs.com/)

## Project Structure

*   `src/pages`: Contains the main pages of the website, including the landing page (`index.astro`) and blog pages.
*   `src/content/blog`: Contains the Markdown/MDX files for the blog posts.
*   `src/components`: Contains reusable components, including Astro components and React components.
*   `src/layouts`: Contains the layout for the blog posts.
*   `public`: Contains static assets such as images, fonts, and PDFs.

# Building and Running

The following commands are available in the `package.json` file:

*   **`bun install`**: Install dependencies.
*   **`bun dev`**: Start the development server at `http://localhost:4321`.
*   **`bun build`**: Build the website for production. The output will be in the `dist` directory.
*   **`bun preview`**: Preview the production build locally.

# Development Conventions

*   The website uses a custom theme inspired by the [Bear Blog](https://github.com/HermanMartinus/bearblog/).
*   The color palette is [Catppuccin Mocha](https://github.com/catppuccin/catppuccin).
*   UI elements are sourced from [MUI](https://mui.com/).
*   The code is formatted using [Prettier](https://prettier.io/) and linted using [ESLint](https://eslint.org/).
*   The project uses [TypeScript](https://www.typescriptlang.org/) for type checking.
