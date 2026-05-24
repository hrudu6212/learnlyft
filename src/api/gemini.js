const API_KEY = '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';
const MODEL = 'arcee-ai/trinity-large-thinking:free';
const BASE_URL = `https://openrouter.ai/api/v1/chat/completions`;

function parseJSON(text) {
  let cleaned = (text || '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

async function callGemini(prompt, options = {}) {
  const { jsonMode = true, pdfBase64 = null } = options;

  const content = [];
  content.push({ type: 'text', text: prompt });

  if (pdfBase64) {
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:application/pdf;base64,${pdfBase64}`
      }
    });
  }

  const body = {
    model: MODEL,
    messages: [{ role: 'user', content }],
    temperature: 0.7,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'LearnLyft'
    },
    body: JSON.stringify({ ...body, reasoning: { enabled: true } }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return jsonMode ? parseJSON(text) : text;
}

const DEPTH_PREFIX = `SUPER DEPTH MODE ENABLED: Provide EXTREMELY detailed, comprehensive, graduate-level content. Go 10x deeper than normal. Include advanced concepts, nuances, edge cases, real-world applications, historical context, expert insights, and mathematical/technical details where relevant.\n\n`;

const PDF_NOTE = `\n\nIMPORTANT: A PDF source document has been attached. Use the content from this PDF as the PRIMARY source material. Extract key information from it and incorporate it into your response. Reference specific content from the PDF.`;

function buildPrompt(base, opts = {}) {
  let prompt = '';
  if (opts.depthMode) prompt += DEPTH_PREFIX;
  prompt += base;
  if (opts.pdfBase64) prompt += PDF_NOTE;
  return prompt;
}

export async function generateStudyGuide(topic, opts = {}) {
  const d = opts.depthMode;
  const prompt = buildPrompt(`Create a comprehensive study guide for: "${topic}".
Return JSON:
{
  "title": "string",
  "introduction": "string (2-3 sentences)",
  "sections": [
    {
      "heading": "string",
      "content": "string (detailed markdown, ${d ? '5-8 paragraphs with examples and formulas' : '3-5 paragraphs'})",
      "keyTakeaway": "string"
    }
  ],
  "summary": "string"
}
Include ${d ? '12-15 extremely detailed' : '5-7'} sections.`, opts);
  return callGemini(prompt, { pdfBase64: opts.pdfBase64 });
}

export async function generateFlowchart(topic, opts = {}) {
  const d = opts.depthMode;
  const prompt = buildPrompt(`Create a learning roadmap/flowchart for: "${topic}".
Return JSON:
{
  "title": "string",
  "nodes": [
    {
      "id": 1,
      "label": "string (short title)",
      "description": "string (${d ? '2-4 detailed sentences' : '1-2 sentences'})",
      "type": "start|concept|practice|milestone|end"
    }
  ]
}
Include ${d ? '15-20' : '8-12'} nodes. First must be "start", last must be "end".`, opts);
  return callGemini(prompt, { pdfBase64: opts.pdfBase64 });
}

export async function generateReport(topic, opts = {}) {
  const d = opts.depthMode;
  const prompt = buildPrompt(`Write a comprehensive report on: "${topic}".
Return JSON:
{
  "title": "string",
  "abstract": "string (${d ? '5-6 sentences' : '3-4 sentences'})",
  "sections": [
    {
      "heading": "string",
      "content": "string (detailed markdown)"
    }
  ],
  "conclusion": "string",
  "references": ["string"]
}
Include ${d ? '10-12 deeply detailed' : '5-6'} sections with ${d ? 'academic rigor, citations, and analysis' : 'thorough content'}.`, opts);
  return callGemini(prompt, { pdfBase64: opts.pdfBase64 });
}

export async function generateKeyPoints(topic, opts = {}) {
  const d = opts.depthMode;
  const prompt = buildPrompt(`Extract the most important key points for: "${topic}".
Return JSON:
{
  "title": "string",
  "points": [
    {
      "title": "string",
      "description": "string (${d ? '4-5 detailed sentences with examples' : '2-3 sentences'})",
      "importance": "high|medium|low"
    }
  ],
  "tips": ["string"]
}
Include ${d ? '20-25' : '10-12'} key points and ${d ? '8-10' : '3-5'} study tips.`, opts);
  return callGemini(prompt, { pdfBase64: opts.pdfBase64 });
}

export async function generateQuiz(topic, opts = {}) {
  const d = opts.depthMode;
  const prompt = buildPrompt(`Create a quiz about: "${topic}".
Return JSON:
{
  "title": "string",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["string","string","string","string"],
      "correct": 0,
      "explanation": "string (${d ? 'detailed 2-3 sentence explanation' : 'brief explanation'})"
    }
  ]
}
Include exactly ${d ? '20' : '10'} MCQ questions${d ? ' ranging from intermediate to expert difficulty' : ' of varying difficulty'}. "correct" is the 0-indexed correct option.`, opts);
  return callGemini(prompt, { pdfBase64: opts.pdfBase64 });
}
