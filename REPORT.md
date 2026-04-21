# Smart Study Assistant - Project Report

## 1. Project Overview
The Smart Study Assistant is an AI-powered web application designed to help students analyze study materials more efficiently.  
The system allows users to upload PDF files, extract text, and generate structured study content such as summaries, key points, and questions.

---

## 2. AI Integration & Engineering
The project integrates AI using the Groq API.

### AI Workflow:
1. User uploads a PDF file
2. The system extracts text using pdfjs
3. The extracted text is sent to the AI model
4. The AI processes the content and returns:
   - Summary
   - Key points
   - Questions

### Prompt Design:
The AI is instructed to return structured JSON output:
```json
{
  "summary": "...",
  "keyPoints": ["..."],
  "questions": ["..."]
}
