# SecureShare

SecureShare is a minimal, production-minded file sharing app built with Next.js.
Upload a file, encrypt it in the browser, and share a secure link.

## Features
- Encrypted uploads to Cloudinary
- Client-side encryption (zero-knowledge)
- Auth-required dashboard access
- Download tracking on verified requests

## Tech Stack
- Next.js App Router
- MongoDB with Mongoose
- Cloudinary storage
- Tailwind CSS

## Getting Started
1. Install dependencies
```
npm install
```
2. Create `.env.local`
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
3. Run the development server
```
npm run dev
```
Open `http://localhost:3000`.

## Notes
- Upload size is capped at 20MB per file.
- The decryption key lives in the link fragment (`#key=`). It is never sent to the server.
- If the link is lost, the file cannot be decrypted.
