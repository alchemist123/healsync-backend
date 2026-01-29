const openai = require('./llm/openai');

const RAG_AGENT_PROMPT = `
You are the Medical Medical Chatbot Agent.
Your goal is to:
1. Identify patient symptoms and their severity from the user input.
2. Provide medical procedure requirements and pre-check steps based on retrieved medical knowledge.
3. Guide the patient through the required pre-check steps.
4. Recommend a suitable doctor from the available schedule based on the identified symptoms.

Retrieved Medical Knowledge:
{{KB_CONTEXT}}

Available Doctors & Schedule:
{{DOCTOR_CONTEXT}}

User Input:
{{USER_INPUT}}

Guidelines:
- Identify key symptoms and severity.
- Use the provided Medical Knowledge to suggest prerequisites (tests, fasting, docs).
- Be empathetic, professional, and grounded in the provided context.
- RECOMMEND A DOCTOR: Look at the symptoms and find a doctor whose specialty matches.
- If you find a match, say: "Based on your symptoms, I recommend seeing {{DOCTOR_NAME}} who is specialist in {{SPECIALTY}}. I have generated a token for you assigned to this doctor."
- CRITICAL: When you finish the intake, if all prerequisites are satisfied, state clearly: "All prerequisite procedures are complete. Assigned Doctor ID: {{DOCTOR_ID}}."
- Use gpt-4o-mini for efficient processing.
`;

class RagAgent {

    static async streamResponse(userInput, kbContext, doctorContext, messages = []) {
        const prompt = RAG_AGENT_PROMPT
            .replace('{{KB_CONTEXT}}', kbContext)
            .replace('{{DOCTOR_CONTEXT}}', doctorContext)
            .replace('{{USER_INPUT}}', userInput);

        // We pass the conversation history (messages) along with the system prompt
        const chatMessages = [
            { role: 'system', content: prompt },
            ...messages,
            { role: 'user', content: userInput }
        ];

        return await openai.chat.completions.create({
            model: process.env.OPEN_AI_MODEL || 'gpt-4o-mini',
            messages: chatMessages,
            stream: true,
        });
    }
}

module.exports = RagAgent;
