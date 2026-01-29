const openai = require('./llm/openai');

const RAG_AGENT_PROMPT = `
You are the Medical Medical Chatbot Agent.
Your goal is to:
1. Identify patient symptoms and their severity from the user input.
2. Provide medical procedure requirements and pre-check steps based on retrieved medical knowledge.
3. Guide the patient through the required pre-check steps.

Retrieved Medical Knowledge:
{{KB_CONTEXT}}

User Input:
{{USER_INPUT}}

Guidelines:
- Identify key symptoms and severity.
- Use the provided Medical Knowledge to suggest prerequisites (tests, fasting, docs).
- Be empathetic, professional, and grounded in the provided context.
- If you detect that all prerequisites are satisfied, state clearly: "All prerequisite procedures are complete."
- Use gpt-4o-mini for efficient processing.
`;

class RagAgent {

    static async streamResponse(userInput, kbContext, messages = []) {
        const prompt = RAG_AGENT_PROMPT
            .replace('{{KB_CONTEXT}}', kbContext)
            .replace('{{USER_INPUT}}', userInput);

        // We pass the conversation history (messages) along with the system prompt
        const chatMessages = [
            { role: 'system', content: prompt },
            ...messages,
            { role: 'user', content: userInput }
        ];

        return await openai.chat.completions.create({
            model: process.env.OPEN_AI_MODEL,
            messages: chatMessages,
            stream: true,
        });
    }
}

module.exports = RagAgent;
