# Digital Library Application (MERN Stack)

A comprehensive digital library application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Authentication System
- Login/signup functionality for both admin and user roles
- Role-based access control

### Admin Features
- Complete CRUD operations for books (add, remove, update)
- Dashboard to manage books and view user activities

### User Features
- Browse and search books with filtering options
- Read books directly within the application
- Rate books and leave comments/reviews

### File Handling
- Multer for file uploads
- Cloudinary for file storage
- MongoDB for storing metadata and URLs

## Project Structure
- `/frontend` - React application with Vite and Tailwind CSS
- `/backend` - Express.js and Node.js server

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with your MongoDB connection string and Cloudinary credentials
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Technologies Used
- Frontend: React with Vite, Tailwind CSS v3
- Backend: Express.js, Node.js
- Database: MongoDB
- File Storage: Cloudinary with Multer
