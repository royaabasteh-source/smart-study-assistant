# Smart Study Assistant

## 📌 Project Overview
Smart Study Assistant is a web application that helps students study more efficiently using AI.  
Users can upload study materials (such as PDF files), and the system automatically generates:

- A summary of the content  
- Key points  
- Practice questions  

The goal of this project is to simplify studying and improve understanding of learning materials.

---

## ⚙️ Features
- Upload PDF files
- Extract text from documents
- Generate AI-based:
  - Summary
  - Key points
  - Questions
- Simple and user-friendly interface

---

## 🧠 AI Integration
The application uses an AI model (via Groq API) to analyze extracted text and generate structured study materials.

The AI is prompted to return results in JSON format:
- summary
- keyPoints
- questions

---

## 🛠️ Technologies Used
- Next.js (Frontend + Backend)
- Node.js
- Groq API (AI)
- pdfjs (PDF text extraction)
- Git & GitHub

---

## 🚀 How to Run the Project

1. Clone the repository:

git clone https://github.com/royaabasteh-source/smart-study-assistant.git

2.Install dependencies:
npm install

3.Create a .env.local file and add your API key:
GROQ_API_KEY=your_api_key_here

4.Run the development server:
npm run dev

5.Open in browser:
http://localhost:3000


----


## ⚠️ Current Limitations

Results are not stored (no database yet)

No user authentication

Output quality depends on AI response


## 🔮 Future Improvements

Save results using Firebase

Add flashcards generation (Q&A format)

Improve prompt engineering for better AI responses

Add difficulty levels (easy, medium, hard)
3ک
