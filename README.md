# React Shopping Site

A modern, responsive e-commerce website built with React, TypeScript, and Directus CMS. Features a clean design, shopping cart functionality, and seamless content management through Directus.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, TypeScript, and Vite for optimal performance
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Shopping Cart**: Full-featured cart with Zustand state management
- **Directus CMS Integration**: Headless CMS for content management
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized with lazy loading, service workers, and efficient bundling
- **SEO Ready**: Meta tags and structured data support

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **CMS**: Directus SDK
- **Animations**: Framer Motion
- **Build Tools**: Vite, ESLint, TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Directus instance (local or cloud)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/react-shopping-site.git
cd react-shopping-site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your Directus instance details:

```env
VITE_DIRECTUS_URL=https://your-directus-instance.com
VITE_SITE_TITLE=Wear Inn
VITE_SITE_DESCRIPTION=Your stylish shopping destination
```

### 4. Directus Setup

1. Create a new Directus project or use an existing instance
2. Create the following collections:
   - `products` (with fields: id, name, description, price, image, category)
   - `categories` (with fields: id, name, slug)
3. Configure public read permissions for these collections
4. (Optional) Add sample product data

#### CORS Configuration

To allow requests from your frontend (`http://localhost:5173`), configure CORS in your Directus instance:

**Option 1: Environment Variable (Recommended)**
Add to your Directus `.env` file:
```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:5173
# Or for multiple origins:
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

**Option 2: Directus Admin Panel**
1. Go to Settings → Security
2. Enable CORS
3. Add `http://localhost:5173` to allowed origins

**Note**: The Vite dev server proxy (configured in `vite.config.ts`) can also help bypass CORS issues during development.

### 5. Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run type-check` - Run TypeScript type checking

## 🏗 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (Header, Footer, Layout)
│   ├── product/         # Product-related components
│   └── cart/            # Shopping cart components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and constants
└── assets/              # Static assets
```

## 🔧 Configuration

### Directus Integration

The app connects to Directus using the `@directus/sdk`. Configure your Directus URL in the `.env` file.

### Styling

- Uses Tailwind CSS for utility-first styling
- Custom color scheme defined in `tailwind.config.js`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_DIRECTUS_URL` | Your Directus instance URL | Yes |
| `VITE_SITE_TITLE` | Site title for meta tags | No |
| `VITE_SITE_DESCRIPTION` | Site description for meta tags | No |

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deployment to Vercel

This project is configured for easy deployment to Vercel:

1. **Push to GitHub**: 
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/react-shopping-site.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**:
   In Vercel's project settings, add these environment variables:
   - `VITE_DIRECTUS_URL` - Your production Directus instance URL (e.g., `https://your-directus-instance.com`)
   - `VITE_SITE_URL` (optional) - Your deployed site URL (e.g., `https://your-site.vercel.app`)

4. **Deploy**: Click "Deploy" and Vercel will build and deploy your site automatically.

### Other Deployment Options

- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **Static Hosting**: Any static host can serve the built files

### Environment Variables for Production

Set the environment variables in your hosting platform's dashboard:

- `VITE_DIRECTUS_URL` - Your production Directus URL (required)
- `VITE_SITE_URL` - Your production site URL (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Directus](https://directus.io/) - Headless CMS
- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
