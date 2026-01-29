const openai = require('./llm/openai');

const STAGE_PROMPTS = {
    GREETING: `
You are in the GREETING stage. 
Be warm and welcoming. Ask the patient how they are feeling or how you can assist them today.
Do not ask for detailed symptoms yet unless they provide them.
`,
    SYMPTOMS: `
You are in the SYMPTOMS stage.
Focus on identifying symptoms and their severity. 
Use the Retrieved Medical Knowledge to ask relevant follow-up questions (e.g., fasting status for tests).
Retrieved Knowledge: {{KB_CONTEXT}}
`,
    DOCTOR_ID: `
You are in the DOCTOR_ID stage.
Based on the identified symptoms, recommend a doctor from the list below.
Explain WHY you are recommending them.
Available Doctors: {{DOCTOR_CONTEXT}}
`,
    SCHEDULING: `
You are in the SCHEDULING stage.
The patient needs to pick a date and time slot for the recommended doctor.
Use the provided schedule data to suggest available days and times.
Current Schedule: {{SCHEDULE_CONTEXT}}
`,
    TOKEN_GENERATION: `
You are in the TOKEN_GENERATION stage.
The appointment is confirmed. Inform the patient that their token is being generated.
Mention the Doctor and the selected Time.
`
};

const RAG_AGENT_PROMPT = `
You are the Medical Chatbot Agent.
Your current stage is: {{STAGE}}

{{STAGE_INSTRUCTIONS}}

Conversation History:
{{HISTORY}}

User Input:
{{USER_INPUT}}

Guidelines:
- Be empathetic and professional.
- STRICTLY follow the instructions for the current stage.
- If in SCHEDULING stage, do not generate a token until a specific time is confirmed.
- If in TOKEN_GENERATION stage, ensure "token_generation" is set to true and "doctor_id" is provided.
- CRITICAL: "doctor_id" is MANDATORY if "token_generation" is true.

Return the response STRICTLY as a JSON object with this format:
{
  "response_message": "Your message to the patient",
  "doctor_id": "",
  "token_generation": true/false,
  "selected_date": "YYYY-MM-DD",
  "selected_time": "HH:MM"
}
`;

class RagAgent {

    static async generateResponse(userInput, stage, stageContext, history = []) {
        const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

        let stageInstructions = STAGE_PROMPTS[stage] || STAGE_PROMPTS.SYMPTOMS;

        // Replace context placeholders in stage instructions
        if (stageContext.kbContext) stageInstructions = stageInstructions.replace('{{KB_CONTEXT}}', stageContext.kbContext);
        if (stageContext.doctorContext) stageInstructions = stageInstructions.replace('{{DOCTOR_CONTEXT}}', stageContext.doctorContext);
        if (stageContext.scheduleContext) stageInstructions = stageInstructions.replace('{{SCHEDULE_CONTEXT}}', stageContext.scheduleContext);

        const prompt = RAG_AGENT_PROMPT
            .replace('{{STAGE}}', stage)
            .replace('{{STAGE_INSTRUCTIONS}}', stageInstructions)
            .replace('{{HISTORY}}', historyText)
            .replace('{{USER_INPUT}}', userInput);

        const chatMessages = [
            { role: 'system', content: prompt },
            ...history,
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
