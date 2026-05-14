# Smart Study Assistant

## 📌 Project Overview

Smart Study Assistant is an AI-powered learning platform designed to help students study more efficiently using generative AI.

Users can upload PDF files or paste text content, and the system automatically generates:

- Summaries
- Key points
- Practice questions
- Flashcards

The application also supports user authentication, personalized history, and interactive study modes.

---

# ✨ Features

## 📄 Study Material Analysis
- Upload PDF documents
- Paste raw text
- AI-powered content analysis

## 🧠 AI Study Generation
Generate:
- Summaries
- Key points
- Practice questions
- Flashcards

## 🎯 Question Types
Supported question modes:
- Multiple Choice
- Fill in the Blank
- Short Answer
- Long Answer

## ⚙ Difficulty Levels
Users can choose:
- Easy
- Medium
- Hard

## 🔐 Authentication
Firebase Authentication with:
- Register
- Login
- Logout

## ☁ Firebase Integration
- Save analyses to Firestore
- User-specific history
- Rename saved analyses
- Delete saved analyses

## 🎨 Modern UI/UX
- Glassmorphism design
- Modal-based history viewer
- Toast notifications
- Animated interactions
- Dark mode support

---

# 🧠 AI Integration

The application uses the Groq API with Llama models for AI-powered content generation.

The AI system is prompt-engineered to generate structured JSON responses including:
- Summary
- Key points
- Questions
- Flashcards

---

# 🛠 Technologies Used

## Frontend
- Next.js 16
- React
- Tailwind CSS
- Framer Motion

## Backend
- Next.js API Routes
- Node.js

## AI
- Groq API
- Llama 3.1

## Database & Auth
- Firebase Firestore
- Firebase Authentication
- Firebase Admin SDK

## Other Libraries
- react-hot-toast
- lucide-react
- pdfjs

---

# 🏗 Architecture

The project follows a secure architecture:

```text
Frontend → Next.js API Routes → Firebase / AI APIs