import { verifyToken } from '../../lib/auth';
import clientPromise from '../../lib/mongo';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import formidable from 'formidable';
import { ObjectId } from 'mongodb';
import { PDFDocument } from 'pdf-lib';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication using custom JWT
    const token = req.cookies.token;
    if (!token) {
      console.error('No token found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userId;
    try {
      const payload = await verifyToken(token);
      console.log('Token payload:', payload);
      
      // Ensure userId is a valid ObjectId string
      if (!payload.id || !ObjectId.isValid(payload.id)) {
        throw new Error('Invalid user ID in token');
      }
      userId = payload.id;
      console.log('Extracted user ID:', userId);
    } catch (error) {
      console.error('Invalid token:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Parse form data
    const form = formidable({ 
      uploadDir: path.join(process.cwd(), 'temp'),
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      maxTotalFileSize: 20 * 1024 * 1024, // 20MB
      filter: ({ mimetype }) => {
        // Log the mimetype for debugging
        console.log('Received mimetype:', mimetype);
        
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ];
        
        const isValid = mimetype && allowedTypes.includes(mimetype);
        console.log('File type validation:', { mimetype, isValid });
        
        return isValid;
      },
      filename: (name, ext, part) => {
        return `${Date.now()}-${name}${ext}`;
      }
    });

    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let file;
    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('Formidable parse error:', err);
            reject(err);
          }
          resolve([fields, files]);
        });
      });

      console.log('Form fields:', fields);
      console.log('Form files:', files);

      if (!files || !files.file) {
        throw new Error('No file uploaded');
      }

      file = files.file;
      if (Array.isArray(file)) {
        file = file[0];
      }

      if (!file) {
        throw new Error('File object is empty');
      }

      // Log file details
      console.log('File details:', {
        filepath: file.filepath,
        originalFilename: file.originalFilename,
        mimetype: file.mimetype,
        size: file.size
      });

      if (!file.filepath) {
        throw new Error('File path is undefined');
      }

      if (!fs.existsSync(file.filepath)) {
        throw new Error('File does not exist at path: ' + file.filepath);
      }

      // Verify file size
      const stats = fs.statSync(file.filepath);
      if (stats.size === 0) {
        throw new Error('Uploaded file is empty');
      }

    } catch (error) {
      console.error('Error processing uploaded file:', error);
      return res.status(400).json({ 
        error: 'Failed to process uploaded file',
        details: error.message 
      });
    }

    // Extract text based on file type
    let content;
    try {
      const buffer = fs.readFileSync(file.filepath);
      console.log('File buffer size:', buffer.length);
      console.log('File mimetype:', file.mimetype);

      if (buffer.length === 0) {
        throw new Error('File buffer is empty');
      }

      if (file.mimetype === 'application/pdf') {
        console.log('Processing PDF file...');
        try {
          console.log('PDF buffer details:', {
            length: buffer.length,
            firstBytes: buffer.slice(0, 100).toString('hex')
          });
          
          // Load the PDF document
          const pdfDoc = await PDFDocument.load(buffer);
          console.log('PDF loaded successfully');
          console.log('Number of pages:', pdfDoc.getPageCount());
          
          // Extract text from each page
          let extractedText = '';
          const pages = pdfDoc.getPages();
          
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            console.log(`Processing page ${i + 1} (${width}x${height})`);
            
            // Get the text content
            const textContent = await page.getTextContent();
            if (textContent) {
              extractedText += textContent + '\n';
            }
          }
          
          content = extractedText.trim();
          console.log('PDF text length:', content.length);
          console.log('First 100 chars of PDF text:', content.substring(0, 100));
          
          if (!content || content.trim().length === 0) {
            throw new Error('PDF contains no extractable text. This might be an image-only PDF or the text might be embedded in images.');
          }

          // Clean up the extracted text
          content = content
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
            .trim();

        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          throw new Error('Failed to parse PDF file: ' + pdfError.message);
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.mimetype === 'application/msword') {
        console.log('Processing Word document...');
        try {
          const result = await mammoth.extractRawText({ buffer });
          console.log('Mammoth result:', result);
          if (!result || !result.value) {
            console.log('No value in mammoth result');
            throw new Error('No text content found in the document');
          }
          content = result.value;
          console.log('Word document text length:', content.length);
          console.log('First 100 chars of Word text:', content.substring(0, 100));
        } catch (mammothError) {
          console.error('Mammoth processing error:', mammothError);
          // Try to read the file as plain text as a fallback
          try {
            content = buffer.toString('utf-8');
            console.log('Fallback: Reading file as plain text, length:', content.length);
            console.log('First 100 chars of plain text:', content.substring(0, 100));
          } catch (textError) {
            console.error('Plain text fallback error:', textError);
            throw new Error(`Failed to process Word document: ${mammothError.message}`);
          }
        }
      } else {
        console.error('Unsupported file type:', file.mimetype);
        fs.unlinkSync(file.filepath);
        return res.status(400).json({ error: 'Unsupported file type' });
      }

      if (!content || content.trim().length === 0) {
        console.error('No content after extraction');
        throw new Error('No text content could be extracted from the file');
      }

    } catch (error) {
      console.error('Error extracting text from file:', error);
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(500).json({ 
        error: 'Failed to extract text from file',
        details: error.message 
      });
    }

    // Truncate content to avoid token limits
    const maxTextLength = 6000; // Reduced from 3000 to allow for more content while staying within token limits
    const truncatedText = content.slice(0, maxTextLength);
    console.log('Truncated text length:', truncatedText.length);

    // Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create prompt for flashcard generation
    const prompt = `
From the following text, generate a comprehensive set of flashcards that thoroughly covers all the important information. Follow these guidelines:

1. Exclude:
   - Table of contents
   - Page numbers
   - Chapter titles
   - Section headers
   - References/bibliography
   - Any non-educational content

2. For each important concept or piece of information, create a flashcard with:
   - A clear, concise question on the front
   - A detailed, accurate answer on the back
   - The appropriate topic/category

3. Generate a substantial number of cards to thoroughly cover the material. For a document of this length, aim for at least 30-50 cards to ensure comprehensive coverage.

4. IMPORTANT: Your response must be a valid JSON array containing the flashcards. Do not include any markdown formatting or additional text.

5. Format each card exactly like this example:
{
  "topic": "Topic Name",
  "front": "Clear, concise question?",
  "back": "Detailed, accurate answer.",
  "public": "yes",
  "createdBy": "system",
  "cardSet": "AutoGenerated",
  "createdOn": "${new Date().toISOString().split('T')[0]}"
}

Text to process:
${truncatedText}
`;

    let completion;
    try {
      console.log('Sending request to OpenAI...');
      console.log('Text length:', truncatedText.length);
      console.log('Estimated token count:', Math.ceil(truncatedText.length / 4));
      
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator specializing in creating comprehensive study materials. Your task is to analyze the provided text and create a thorough set of flashcards that cover all important concepts, facts, and information. Create a substantial number of cards (30-50 for this text) to ensure complete coverage of the material. Focus on extracting and organizing educational content while excluding non-essential elements. Each card should test a specific piece of knowledge or understanding. Your response must be a valid JSON array containing the flashcards, with no additional text or formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      });
      console.log('OpenAI response received');
    } catch (error) {
      console.error('OpenAI API error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status
      });
      return res.status(500).json({ 
        error: 'Failed to generate flashcards',
        details: error.message 
      });
    }

    const output = completion.choices[0].message.content;
    console.log('OpenAI output length:', output.length);
    console.log('First 500 chars of output:', output.substring(0, 500));

    let flashcards;
    try {
      const cleanedOutput = output
        .replace(/```json\n?/, '')
        .replace(/```/, '')
        .replace(/\n$/, '')
        .trim();

      // Parse the JSON and ensure it's an array
      const parsedData = JSON.parse(cleanedOutput);
      flashcards = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      console.log('Parsed flashcards:', flashcards);
      
      if (!flashcards.length) {
        throw new Error('No flashcards were generated');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw output:', output);
      return res.status(500).json({ 
        error: 'Failed to parse flashcard data',
        details: error.message,
        rawOutput: output 
      });
    }

    // Connect to database and create deck
    let client;
    try {
      console.log('Connecting to MongoDB...');
      client = await clientPromise;
      const db = client.db('mydb');
      console.log('Connected to MongoDB database: mydb');
      
      // Verify the decks collection exists
      const collections = await db.listCollections().toArray();
      const deckCollectionExists = collections.some(col => col.name === 'decks');
      if (!deckCollectionExists) {
        console.log('Creating decks collection...');
        await db.createCollection('decks');
      }
      
      const deckId = uuidv4();
      console.log('Generated deck ID:', deckId);
      
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const deck = {
        _id: new ObjectId(),
        name: file.originalFilename.split('.')[0],
        createdBy: user.email,
        createdOn: new Date(),
        cardIds: [],
        stats: {
          views: 0,
          likes: 0,
          shares: 0
        }
      };

      // Create flashcards collection if it doesn't exist
      const flashcardCollectionExists = collections.some(col => col.name === 'flashcards');
      if (!flashcardCollectionExists) {
        console.log('Creating flashcards collection...');
        await db.createCollection('flashcards');
      }

      // Insert flashcards and collect their IDs
      const flashcardIds = [];
      for (const card of flashcards) {
        const flashcard = {
          _id: new ObjectId(),
          topic: card.topic,
          front: card.front,
          back: card.back,
          public: false,
          createdBy: user.email,
          cardSet: deck._id,
          createdOn: new Date()
        };
        
        const result = await db.collection('flashcards').insertOne(flashcard);
        flashcardIds.push(result.insertedId);
      }

      // Update deck with flashcard IDs
      deck.cardIds = flashcardIds;

      console.log('Preparing to insert deck:', {
        deckId: deck._id,
        name: deck.name,
        createdBy: deck.createdBy,
        cardCount: deck.cardIds.length
      });

      const result = await db.collection('decks').insertOne(deck);
      console.log('Deck inserted successfully:', result);

      if (!result.insertedId) {
        throw new Error('Failed to create deck: No inserted ID returned');
      }

      // Clean up temporary file
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }

      return res.status(200).json({ 
        success: true, 
        deckId: deck._id,
        message: 'Flashcards created successfully' 
      });
    } catch (error) {
      console.error('Database error:', error);
      // Clean up temporary file in case of error
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      return res.status(500).json({ 
        error: 'Failed to save flashcards',
        details: error.message 
      });
    }

  } catch (error) {
    console.error('General error:', error);
    return res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
}

async function render_page(pageData) {
  const render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: false,
    disableFontFace: true,
    ignoreErrors: true
  };

  return pageData.getTextContent(render_options)
    .then(function(textContent) {
      let lastY, text = '';
      for (let item of textContent.items) {
        if (lastY == item.transform[5] || !lastY) {
          text += item.str + ' ';
        } else {
          text += '\n' + item.str + ' ';
        }
        lastY = item.transform[5];
      }
      return text;
    })
    .catch(error => {
      console.warn('Error rendering page:', error);
      return ''; // Return empty string for pages that fail to render
    });
}
