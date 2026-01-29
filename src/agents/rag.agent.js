const openai = require('./llm/openai');

const RAG_AGENT_PROMPT = `
You are the Medical Chatbot Agent.
Your goal is to:
1. Identify patient symptoms and their severity from the user input.
2. Provide medical procedure requirements and pre-check steps based on retrieved medical knowledge.
3. Guide the patient through the required pre-check steps.
4. Recommend a suitable doctor from the available schedule based on the identified symptoms.

Retrieved Medical Knowledge:
{{KB_CONTEXT}}

Available Doctors & Schedule:
{{DOCTOR_CONTEXT}}

Conversation History:
{{HISTORY}}

User Input:
{{USER_INPUT}}

Guidelines:
- Identify key symptoms and severity.
- Use the provided Medical Knowledge to suggest prerequisites (tests, fasting, docs).
- Use the Conversation History to maintain context of what has already been discussed.
- Be empathetic, professional, and grounded in the provided context.
- RECOMMEND A DOCTOR: If symptoms match a specialty, provide the Doctor ID.
- COMPLETION: If all prerequisites are satisfied and the intake is complete, set "token_generation" to true and provide the "doctor_id".

Return the response STRICTLY as a JSON object with this format:
{
  "response_message": "Your message to the patient",
  "doctor_id": "UUID of the recommended doctor (if any)",
  "token_generation": true/false
}
`;

class RagAgent {

    static async generateResponse(userInput, kbContext, doctorContext, messages = []) {
        // Format history for the prompt string
        const historyText = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

        const prompt = RAG_AGENT_PROMPT
            .replace('{{KB_CONTEXT}}', kbContext)
            .replace('{{DOCTOR_CONTEXT}}', doctorContext)
            .replace('{{HISTORY}}', historyText)
            .replace('{{USER_INPUT}}', userInput);


        const chatMessages = [
            { role: 'system', content: prompt },
            ...messages,
            { role: 'user', content: userInput }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: chatMessages,
            response_format: { type: "json_object" },
        });

        return JSON.parse(response.choices[0].message.content);
    }
}

module.exports = RagAgent;
