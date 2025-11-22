# React Shopping Site

A modern, responsive e-commerce website built with React, TypeScript, and Supabase. Features a clean design, shopping cart functionality, and seamless backend integration through Supabase.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, TypeScript, and Vite for optimal performance
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Shopping Cart**: Full-featured cart with Zustand state management
- **Supabase Backend**: Complete backend solution with database, auth, and storage
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized with lazy loading, service workers, and efficient bundling
- **SEO Ready**: Meta tags and structured data support

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Backend**: Supabase (Database, Auth, Storage)
- **Animations**: Framer Motion
- **Build Tools**: Vite, ESLint, TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

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

Edit `.env` with your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://your-site.vercel.app
```

### 4. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Configure Row Level Security (RLS) policies as needed
4. (Optional) Add sample product data using the Supabase dashboard

#### Authentication

Supabase handles authentication automatically. Configure auth providers in your Supabase dashboard under Authentication → Settings.

**Note**: All database operations go through Supabase's secure API with built-in RLS.

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

### Supabase Integration

The app connects to Supabase using the official Supabase JavaScript client. Configure your Supabase URL and anon key in the `.env` file.

### Styling

- Uses Tailwind CSS for utility-first styling
- Custom color scheme defined in `tailwind.config.js`
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_SITE_URL` | Your deployed site URL | No |

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
    - `VITE_SUPABASE_URL` - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
    - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
    - `VITE_SITE_URL` (optional) - Your deployed site URL (e.g., `https://your-site.vercel.app`)

4. **Deploy**: Click "Deploy" and Vercel will build and deploy your site automatically.



### Other Deployment Options

- **Vercel**: Follow the Vercel deployment instructions above
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **Static Hosting**: Any static host can serve the built files

### Environment Variables for Production

Set the environment variables in your hosting platform's dashboard:

- `VITE_SUPABASE_URL` - Your Supabase project URL (required)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (required)
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

- [Supabase](https://supabase.com/) - Backend as a Service
- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
