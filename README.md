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


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Dicon Estate

Dicon Estate is a Next.js property site with a protected media backend for Carousel, Housing, Land, and Painting collections.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin workspace is at `/backend`.

Without Blob credentials, local development stores files in ignored `public/uploads/` and tracks stacks in ignored `data/media-library.json`.

## Vercel deployment

1. Create a GitHub repository and push the project:

```bash
git init
git add .
git commit -m "Prepare Dicon Estate for production"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

2. In Vercel, choose **Add New Project**, import the GitHub repository, and keep the detected Next.js settings.

3. Create a Vercel Blob store from the project dashboard under **Storage**, then connect it to the project.

4. Add these Environment Variables in Vercel for **Production, Preview, and Development**:

```text
BLOB_READ_WRITE_TOKEN=<token from the connected Vercel Blob store>
ADMIN_PASSWORD=<long unique admin password>
ADMIN_SESSION_SECRET=<long random secret, at least 32 characters>
```

5. Redeploy after saving the variables. Open the deployed public URL for the frontend and append `/backend` for the protected admin workspace.

6. Verify the deployment:

```text
https://YOUR_DOMAIN.vercel.app/
https://YOUR_DOMAIN.vercel.app/backend
https://YOUR_DOMAIN.vercel.app/api/upload?collection=carousel
```

The public feed endpoints remain readable so the frontend can sync in real time. `POST`, `PATCH`, and `DELETE` media operations require the authenticated admin session. Do not commit `.env` files or production secrets.

## Validation

```bash
npm run build
npm run lint
```
