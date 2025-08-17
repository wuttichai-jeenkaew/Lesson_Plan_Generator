# Lesson Plan Generator 📚

A modern web application for creating, managing, and exporting lesson plans with support for Thai and English content.

## ✨ Features

- 📝 **Create Lesson Plans** - Generate comprehensive lesson plans with objectives, activities, and assessments
- 🔍 **Search & Filter** - Find lesson plans by level, subject, or search terms
- 📄 **PDF Export** - Export lesson plans to PDF with Thai/English font support
- 🖼️ **Image Integration** - Add relevant images from Unsplash and Pixabay
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🗂️ **Pagination** - Efficient browsing of large lesson plan collections
- 🎨 **Modern UI** - Clean and intuitive user interface

## 🚀 Quick Start

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **PDF Export**: jsPDF + html2canvas
- **Image APIs**: Unsplash + Pixabay
- **Validation**: Zod

## 📖 Documentation

- [PDF Export Feature](./docs/PDF_EXPORT_FEATURE.md) - Detailed documentation for PDF export functionality

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
