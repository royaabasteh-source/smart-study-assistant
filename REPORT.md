# Smart Study Assistant - Project Report

# 1. Project Overview

Smart Study Assistant is an AI-powered educational web application designed to help students study more efficiently using generative AI technologies.

The application allows users to:
- Upload PDF files
- Paste study text
- Generate summaries
- Extract key points
- Create different types of practice questions
- Generate flashcards

The system also supports user authentication and personalized study history.

---

# 2. AI Integration & Engineering

The application integrates AI using the Groq API with Llama models.

## AI Workflow

1. User uploads a PDF or pastes text
2. Text is extracted and processed
3. The content is sent to the AI model
4. The AI generates:
   - Summary
   - Key points
   - Questions
   - Flashcards

---

## Prompt Engineering

The AI prompt dynamically changes based on:
- Difficulty level
- Question type
- Study mode

Supported question types:
- Multiple Choice
- Fill in the Blank
- Short Answer
- Long Answer

The AI is instructed to return structured JSON output for reliable parsing.

Example structure:

```json
{
  "summary": "...",
  "keyPoints": ["..."],
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "..."
    }
  ]
}