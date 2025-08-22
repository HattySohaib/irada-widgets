# Irada Widgets

A modern, minimal React widget library for displaying blogs and content from your CMS. Built with a shadcn-like design system that fits seamlessly into any website design.

## Features

- 🎨 **Minimal Design**: Clean, outline-based design that adapts to any design language
- 🌙 **Dark/Light Themes**: Built-in theme support with automatic switching
- 🎯 **Customizable**: Extensive CSS variables for complete design control
- 📱 **Responsive**: Works perfectly on all screen sizes
- ⚡ **Lightweight**: No heavy dependencies, just React and CSS
- 🔧 **Easy Integration**: Simple props-based configuration
- ♾️ **Infinite Scroll**: Smooth pagination with automatic loading
- 📊 **Rich Content**: Displays tags, stats, and metadata

## Installation

```bash
npm install irada-widgets
```

## Quick Start

```jsx
import { IradaBlogsPage } from "irada-widgets";
import "irada-widgets/irada-widget.css";

function App() {
  return (
    <IradaBlogsPage
      apiKey="your-api-key"
      theme="light"
      apiEndpoint="https://your-api.com"
    />
  );
}
```

## Components

### IradaBlogsPage

The main component that displays a grid of blog cards with navigation to individual blog posts.

#### Props

| Prop          | Type              | Default                              | Description                     |
| ------------- | ----------------- | ------------------------------------ | ------------------------------- |
| `apiKey`      | string            | -                                    | Your API key for authentication |
| `theme`       | 'light' \| 'dark' | 'light'                              | Theme to use                    |
| `apiEndpoint` | string            | 'https://bloggestapi.sohaibaftab.me' | Your API endpoint               |
| `header`      | ReactNode         | -                                    | Optional header component       |

#### Example

```jsx
<IradaBlogsPage
  apiKey="your-api-key"
  theme="dark"
  apiEndpoint="https://api.yourcms.com"
  header={<h1>My Blog</h1>}
/>
```

## Customization

### CSS Variables

The widgets use CSS variables for all styling, making them highly customizable. You can override any variable to match your design:

```css
.irada-widget {
  /* Colors */
  --irada-primary: #3b82f6;
  --irada-background: #ffffff;
  --irada-text: #000000;
  --irada-border: #e5e7eb;

  /* Spacing */
  --irada-spacing: 1rem;
  --irada-radius: 8px;

  /* Typography */
  --irada-font-family: "Inter", sans-serif;
  --irada-font-size: 1rem;
}
```

### Available Variables

#### Colors

- `--irada-primary`: Primary color for links and accents
- `--irada-secondary`: Secondary color for less prominent elements
- `--irada-background`: Main background color
- `--irada-background-secondary`: Secondary background for cards
- `--irada-text`: Primary text color
- `--irada-text-secondary`: Secondary text color
- `--irada-border`: Border color
- `--irada-border-hover`: Border color on hover

#### Spacing

- `--irada-spacing-xs`: 0.5rem
- `--irada-spacing-sm`: 0.75rem
- `--irada-spacing`: 1rem
- `--irada-spacing-lg`: 1.5rem
- `--irada-spacing-xl`: 2rem

#### Border Radius

- `--irada-radius`: 6px
- `--irada-radius-lg`: 8px
- `--irada-radius-xl`: 12px

#### Typography

- `--irada-font-family`: Font family
- `--irada-font-size-sm`: 0.875rem
- `--irada-font-size`: 1rem
- `--irada-font-size-lg`: 1.125rem
- `--irada-font-size-xl`: 1.25rem
- `--irada-font-size-2xl`: 1.5rem
- `--irada-font-size-3xl`: 1.875rem

### Theme Examples

#### Minimal Dark Theme

```css
.irada-widget {
  --irada-background: #0a0a0a;
  --irada-background-secondary: #1a1a1a;
  --irada-text: #ffffff;
  --irada-border: #333333;
  --irada-primary: #ffffff;
}
```

#### Colorful Theme

```css
.irada-widget {
  --irada-primary: #3b82f6;
  --irada-accent: #ef4444;
  --irada-background: #f8fafc;
  --irada-background-secondary: #ffffff;
  --irada-border: #e2e8f0;
}
```

## API Integration

The widgets expect your API to provide blog data in the following format:

### Blog List Endpoint

```
GET /api/token/blogs?page=1
Headers: { "x-api-key": "your-api-key" }
```

Response:

```json
{
  "data": {
    "blogs": [
      {
        "_id": "blog-id",
        "title": "Blog Title",
        "meta": "Blog description",
        "slug": "blog-slug",
        "banner": "https://example.com/image.jpg",
        "category": "Technology",
        "tags": ["aws", "nodejs"],
        "featured": true,
        "likesCount": 28,
        "viewsCount": 164,
        "publishedAt": "2024-01-22T09:48:22.362Z",
        "updatedAt": "2025-08-19T07:01:46.677Z",
        "author": {
          "_id": "author-id",
          "username": "author",
          "email": "author@example.com",
          "profileImageUrl": "profile.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalBlogs": 31,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Single Blog Endpoint

```
GET /api/blogs/{slug}
Headers: { "Authorization": "Bearer your-api-key" }
```

Response:

```json
{
  "data": {
    "_id": "blog-id",
    "title": "Blog Title",
    "meta": "Blog description",
    "content": "<p>Blog content in HTML</p>",
    "banner": "https://example.com/image.jpg",
    "date": "2024-01-01",
    "category": "Technology",
    "slug": "blog-slug"
  }
}
```

## Development

### Setup

```bash
git clone <repository>
cd irada-widgets
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Storybook

```bash
npm run storybook
```

## Design Philosophy

The widgets follow a minimal, shadcn-like design philosophy:

- **Clean Outlines**: Uses borders instead of filled backgrounds
- **Subtle Shadows**: Minimal shadows for depth
- **Consistent Spacing**: Systematic spacing scale
- **High Contrast**: Accessible color combinations
- **Responsive**: Works on all screen sizes
- **Customizable**: Easy to adapt to any design system

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact us at support@irada.com.
