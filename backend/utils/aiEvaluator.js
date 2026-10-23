const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

async function evaluateCode(questionTitle, questionContent, studentCode, language, actualOutput) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      isCorrect: false,
      feedback: "API Key Error: GEMINI_API_KEY is missing in backend .env file. Cannot evaluate."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `
You are an expert programming instructor evaluating a student's code submission.
Evaluate the code based on the question prompt, the student's logic, and the actual output produced by the code.

Here is the question the student was asked to solve:
---
Title: ${questionTitle}
Description:
${questionContent}
---

Student's Language: ${language}

Student's Code:
---
${studentCode}
---

Actual Execution Output from Judge0:
---
${actualOutput}
---

Task:
Determine if the student's code correctly solves the problem described in the question.
Provide your final verdict in a strict JSON format with exactly two fields:
1. "isCorrect": a boolean (true if the code fully solves the problem, false otherwise).
2. "feedback": a short string (1-3 sentences) explaining why it's correct or what is wrong.

Only output valid JSON, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code block wrappers if Gemini adds them
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    try {
      const jsonResponse = JSON.parse(text);
      return {
        isCorrect: jsonResponse.isCorrect,
        feedback: jsonResponse.feedback
      };
    } catch (parseError) {
      console.error("AI Response Parsing Error:", text);
      return {
        isCorrect: false,
        feedback: "Error parsing AI response. Please try running again."
      };
    }

  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return {
      isCorrect: false,
      feedback: "API Error: " + (error.message || "Unknown error occurred.")
    };
  }
}

module.exports = { evaluateCode };
