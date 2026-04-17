export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { analyzeStudyContent } from '@/lib/ai-service';
import PDFParser from 'pdf2json';

/**
 * Extracts raw text from a PDF buffer using pdf2json.
 * Wraps the event-driven parser in a Promise.
 */
async function extractPDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // pdf2json can sometimes be imported as { default: PDFParser } or just PDFParser
    const ParserClass = (PDFParser as any).default || PDFParser;
    const pdfParser = new ParserClass(null, 1);

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF Parsing Error:', errData.parserError);
      reject(new Error('Failed to parse PDF content'));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        // getRawTextContent() is the most reliable way to get plain text in Node
        const text = (pdfParser as any).getRawTextContent();
        if (!text) {
          reject(new Error('PDF content was empty or unreadable'));
        } else {
          resolve(text);
        }
      } catch (err) {
        reject(new Error('Error processing PDF data'));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const plainText = formData.get('text') as string | null;

    let extractedText = '';
    let usedFallback = false;

    // 1. Handle PDF Upload
    if (file && file.size > 0 && file.type === 'application/pdf') {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        extractedText = await extractPDFText(buffer);
        console.log('Successfully extracted text from PDF.');
      } catch (parseError: any) {
        console.warn('PDF extraction failed, attempting plain text fallback:', parseError.message);
        
        if (plainText && plainText.trim() !== '') {
          extractedText = plainText;
          usedFallback = true;
        } else {
          return NextResponse.json(
            { 
              error: 'Failed to process PDF and no fallback text was provided.',
              details: parseError.message 
            },
            { status: 422 }
          );
        }
      }
    } 
    // 2. Handle Plain Text Input
    else if (plainText && plainText.trim() !== '') {
      extractedText = plainText;
      console.log('Using provided plain text input.');
    }
    // 3. No content provided
    else {
      return NextResponse.json(
        { error: 'Please provide either a PDF file or study text to analyze.' },
        { status: 400 }
      );
    }

    // Final validation of text content
    if (!extractedText || extractedText.trim() === '') {
      return NextResponse.json(
        { error: 'The provided content resulted in empty text. Please check your file or input.' },
        { status: 400 }
      );
    }

    // 4. Analyze via AI Service
    try {
      const resultData = await analyzeStudyContent(extractedText);
      return NextResponse.json({
        ...resultData,
        source: usedFallback ? 'fallback-text' : (file ? 'pdf' : 'text')
      });
    } catch (aiError: any) {
      console.error('AI Analysis Error:', aiError.message);
      
      // If AI fails, we still return the extracted text so the user doesn't lose progress
      // but indicate the failure.
      return NextResponse.json(
        { 
          error: 'Text was extracted successfully, but AI analysis failed.',
          details: aiError.message,
          extractedText: extractedText.substring(0, 500) + '...' // Return a snippet
        },
        { status: 502 }
      );
    }

  } catch (error: any) {
    console.error('API Route Fatal Error:', error);

    return NextResponse.json(
      {
        error: 'A fatal error occurred on the server.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
