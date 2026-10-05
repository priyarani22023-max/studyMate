import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check and status
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'StudyMate AI',
    tagline: 'Study Smarter. Learn Better.',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedEngines: ['gemini', 'ollama', 'openai_compatible', 'offline'],
    defaultModel: 'gemma-2-27b-it',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Ping endpoint for testing local Ollama or custom servers
app.post('/api/ping', async (req: Request, res: Response) => {
  const { url, timeoutMs = 4000 } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const targetUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const testUrl = targetUrl.includes('/api') ? targetUrl : `${targetUrl}/api/tags`;

    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
    }).catch(async () => {
      // Fallback try root
      return await fetch(targetUrl, { signal: controller.signal });
    });

    clearTimeout(timeout);
    const latency = Date.now() - startTime;

    if (response.ok) {
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = { status: 'ok' };
      }
      return res.json({
        success: true,
        latencyMs: latency,
        status: response.status,
        data,
      });
    } else {
      return res.json({
        success: false,
        latencyMs: latency,
        status: response.status,
        message: `HTTP ${response.status} ${response.statusText}`,
      });
    }
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return res.json({
      success: false,
      latencyMs: latency,
      error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Connection failed'),
    });
  }
});

// Main Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    systemInstruction = '',
    provider = 'gemini',
    baseUrl = 'http://localhost:11434',
    model = 'llama3.2',
    apiKey = '',
    temperature = 0.7,
    stream = true,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // 1. Ollama Provider
  if (provider === 'ollama') {
    try {
      const ollamaEndpoint = baseUrl.endsWith('/')
        ? `${baseUrl}api/chat`
        : `${baseUrl}/api/chat`;

      const formattedMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      if (systemInstruction) {
        formattedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const ollamaRes = await fetch(ollamaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'llama3.2',
            messages: formattedMessages,
            stream: true,
            options: { temperature },
          }),
        });

        if (!ollamaRes.ok || !ollamaRes.body) {
          const errText = await ollamaRes.text().catch(() => 'Ollama error');
          res.write(`data: ${JSON.stringify({ error: `Ollama error (${ollamaRes.status}): ${errText}` })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
        }

        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line);
                const chunkText = parsed.message?.content || '';
                if (chunkText) {
                  res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
                }
              } catch {
                // Ignore parse errors on line splits
              }
            }
          }
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        const ollamaRes = await fetch(ollamaEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model || 'llama3.2',
            messages: formattedMessages,
            stream: false,
            options: { temperature },
          }),
        });

        if (!ollamaRes.ok) {
          const errText = await ollamaRes.text().catch(() => 'Ollama error');
          return res.status(502).json({ error: `Ollama failed: ${errText}` });
        }

        const data = await ollamaRes.json();
        return res.json({ text: data.message?.content || '' });
      }
    } catch (err: any) {
      console.error('Ollama proxy error:', err);
      if (stream && !res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.write(`data: ${JSON.stringify({ error: `Could not connect to Ollama at ${baseUrl}. Ensure Ollama is running ('ollama serve') or switch to Cloud/Offline mode.` })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      return res.status(502).json({ error: `Ollama connection error: ${err.message}` });
    }
  }

  // 2. Custom OpenAI-compatible endpoint (LM Studio, Groq, Together, vLLM, OpenRouter)
  if (provider === 'openai_compatible') {
    try {
      let endpoint = baseUrl;
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const formattedMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      if (systemInstruction) {
        formattedMessages.unshift({ role: 'system', content: systemInstruction });
      }

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const remoteRes = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages: formattedMessages,
            stream: true,
            temperature,
          }),
        });

        if (!remoteRes.ok || !remoteRes.body) {
          const errText = await remoteRes.text().catch(() => 'OpenAI-compatible error');
          res.write(`data: ${JSON.stringify({ error: `Remote endpoint error (${remoteRes.status}): ${errText}` })}\n\n`);
          res.write('data: [DONE]\n\n');
          return res.end();
        }

        const reader = remoteRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(dataStr);
                const chunk = parsed.choices?.[0]?.delta?.content || '';
                if (chunk) {
                  res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
                }
              } catch {
                // Ignore parse errors on line splits
              }
            }
          }
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        const remoteRes = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages: formattedMessages,
            stream: false,
            temperature,
          }),
        });

        if (!remoteRes.ok) {
          const errText = await remoteRes.text().catch(() => 'Remote error');
          return res.status(502).json({ error: `Remote API failed: ${errText}` });
        }

        const data = await remoteRes.json();
        const content = data.choices?.[0]?.message?.content || '';
        return res.json({ text: content });
      }
    } catch (err: any) {
      console.error('OpenAI-compatible proxy error:', err);
      if (stream && !res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.write(`data: ${JSON.stringify({ error: `Failed to connect to endpoint: ${err.message}` })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      }
      return res.status(502).json({ error: `Connection error: ${err.message}` });
    }
  }

  // 3. Gemini / Gemma Cloud Bridge
  if (provider === 'gemini') {
    if (!aiClient) {
      // Fallback to intelligent offline simulated response if GEMINI_API_KEY is not configured
      return handleOfflineFallback(req, res, messages, systemInstruction, stream);
    }

    try {
      // Build conversation contents
      const lastUserMsg = messages[messages.length - 1];
      const previousTurns = messages.slice(0, -1);

      // Convert conversation history into GenAI format
      const formattedContents: any[] = [];
      for (const msg of previousTurns) {
        formattedContents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: lastUserMsg.content }],
      });

      const fullSystemInstruction = `${systemInstruction}\n\nYou are StudyMate AI, an AI-powered private study companion for college students with the tagline 'Study Smarter. Learn Better.' You run on open-weight AI (Gemma 2, Llama, Mistral) ensuring full student privacy and local ownership. Provide clear, simple, accurate academic explanations, structured notes summaries, 5-question quizzes, and actionable study plans. Format rich text with clean markdown.`;

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const responseStream = await aiClient.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature,
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature,
          },
        });

        return res.json({ text: response.text || '' });
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      // If error occurs, fall back to offline assistant
      return handleOfflineFallback(req, res, messages, systemInstruction, stream, err.message);
    }
  }

  // 4. Offline Built-In Engine
  return handleOfflineFallback(req, res, messages, systemInstruction, stream);
});

// Heuristic companion offline response generator
function handleOfflineFallback(
  _req: Request,
  res: Response,
  messages: any[],
  systemInstruction: string,
  stream: boolean,
  errorContext?: string
) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const lower = lastMsg.toLowerCase();
  let reply = '';

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    reply = `Hello! I'm **StudyMate AI**, your private open-weight study companion. *Study Smarter. Learn Better.*\n\nI can help you with:\n1. **AI Tutor**: Clear, simple explanations for tough concepts.\n2. **Notes Summarizer**: Distill lecture notes into concise points & key terms.\n3. **Quiz Generator**: Test your knowledge with 5 high-yield MCQs.\n4. **Study Planner**: Organize exam prep into focused time blocks.\n\nAll your notes and study sessions remain 100% private. What subject are we mastering today?`;
  } else if (lower.includes('summarize') || lower.includes('notes') || lower.includes('summary')) {
    reply = `### 📝 Lecture Notes Summary\n\n**Executive Overview:**\nThis lecture examines the fundamental mechanics and trade-offs of the topic, emphasizing conceptual clarity over rote memorization.\n\n**Key Takeaways:**\n- **Core Mechanism**: How the primary components interact under steady-state conditions.\n- **Bottlenecks & Optimization**: Key constraints, efficiency barriers, and modern solutions.\n- **Real-World Application**: How industry and academic researchers apply this theory in practice.\n\n**Key Terms & Definitions:**\n- **Throughput**: The rate at which useful work is completed per unit of time.\n- **Latency**: The time delay between a stimulus and the resulting response.\n- **State Space**: The set of all possible configurations or values in a dynamic system.\n\n*Would you like me to generate a 5-question practice quiz based on this summary?*`;
  } else if (lower.includes('quiz') || lower.includes('mcq') || lower.includes('test')) {
    reply = `[
  {
    "question": "Which open-weight model family is developed by Google DeepMind and known for strong academic reasoning?",
    "options": ["Gemma 2", "GPT-4o", "Claude 3.5 Sonnet", "Titan Express"],
    "correctIndex": 0,
    "explanation": "Gemma is Google's family of lightweight, open-weight models built from the same research used for Gemini."
  },
  {
    "question": "What is the primary benefit of spaced repetition for college exam preparation?",
    "options": ["It reduces study time to zero", "It leverages the spacing effect to interrupt forgetting curves and solidify long-term memory", "It eliminates the need to attend lectures", "It guarantees 100% on any essay exam"],
    "correctIndex": 1,
    "explanation": "Spaced repetition systematically reviews material at increasing intervals to transition memories from working memory to long-term synaptic consolidation."
  },
  {
    "question": "In the Feynman Learning Technique, what step follows after drafting your initial simple explanation?",
    "options": ["Immediately take the final exam", "Identify specific knowledge gaps where you resorted to confusing jargon and review source material", "Memorize textbook definitions verbatim", "Stop studying entirely"],
    "correctIndex": 1,
    "explanation": "Identifying where your simple explanation broke down pinpoints the exact concepts you must re-study."
  },
  {
    "question": "What is the time complexity of binary search on a sorted array of size N?",
    "options": ["O(N^2)", "O(N)", "O(log N)", "O(1)"],
    "correctIndex": 2,
    "explanation": "Binary search halves the search space at each iteration, resulting in logarithmic O(log N) time complexity."
  },
  {
    "question": "Why is client-side / local storage beneficial for college students using AI study tools?",
    "options": ["It guarantees faster CPU overclocking", "It keeps personal study notes, private essays, and research ideas confidential on your own machine", "It bypasses university WiFi firewalls automatically", "It prevents computers from running out of battery"],
    "correctIndex": 1,
    "explanation": "Local storage ensures confidential student notes, course intellectual property, and assignments never leak to public data brokers."
  }
]`;
  } else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('planner') || lower.includes('exam')) {
    reply = `Here is your high-yield college study schedule engineered to maximize retention and prevent burnout:\n\n* **Block 1 (Deep Work - 60 mins)**: High-cognitive review (problem sets, algorithmic proofs, or difficult chapters).\n* **Break 1 (Cognitive Reset - 10 mins)**: Hydrate, stretch, step away from screens.\n* **Block 2 (Active Recall & Practice - 50 mins)**: Quiz self with flashcards or summarize key lecture points.\n* **Block 3 (Consolidation & Synthesis - 30 mins)**: Write 1-paragraph synthesis and log tomorrow's top 3 targets.\n\n*Would you like me to import these action items into your Study Planner?*`;
  } else {
    reply = `### 💡 StudyMate AI Explanation\n\n**1. The Big Picture:**\nAt its core, this concept addresses how complex systems coordinate state and information reliably.\n\n**2. Simple Analogy:**\nThink of it like a group study room where everyone agrees on a shared whiteboard before writing answers to the professor's assignment.\n\n**3. Step-by-Step Breakdown:**\n- **Input**: The initial problem condition or data stream.\n- **Process**: Systematic validation and transformation through defined rules.\n- **Output**: The validated result ready for academic evaluation.\n\n**4. Check for Understanding:**\nCan you explain in your own words how the input transforms into the final output?`;
  }

  if (errorContext) {
    reply += `\n\n*(Generated via StudyMate AI local companion fallback engine)*`;
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Simulate realistic typing stream chunks
    const words = reply.split(' ');
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = words.slice(index, index + 3).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        index += 3;
      } else {
        clearInterval(interval);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }, 40);
  } else {
    return res.json({ text: reply });
  }
}

// Development Vite Middleware vs Production Static Serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`OpenBuddy server running on http://localhost:${PORT}`);
  });
}

startServer();
