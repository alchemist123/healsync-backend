const openai = require('./llm/openai');

const STAGE_ANALYZER_PROMPT = `
You are the Chat Stage Analyzer Agent.
Your goal is to identify the current stage of the medical intake conversation.

Stages:
1. GREETING: Initial interaction, "hello", "how are you", or starting the conversation.
2. SYMPTOMS: The patient is describing symptoms or you are asking for more clinical details.
3. DOCTOR_ID: You have enough info to recommend a specific doctor from the available list.
4. SCHEDULING: A doctor has been recommended, and you are now discussing availability and picking a date/time.
5. TOKEN_GENERATION: The patient has agreed on a schedule, and you are ready to issue the final token.

Rules:
- Output ONLY a JSON object.
- Consider the Chat History to see what has already been accomplished.
- If symptoms are clear but no doctor is picked yet, it's SYMPTOMS until a recommendation is made.
- If a doctor details are found in history, and the user is asking about timing, it's SCHEDULING.
- If a date/time is confirmed, it's TOKEN_GENERATION.

Return the response STRICTLY as a JSON object with this format:
{
  "stage": "STAGE_NAME"
}

Chat History:
{{HISTORY}}

User Input:
{{USER_INPUT}}

Available Doctors:
{{DOCTOR_CONTEXT}}
`;

class StageAnalyzerAgent {

    static async analyzeStage(userInput, history = [], doctorContext = "") {
        const historyText = history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

        const prompt = STAGE_ANALYZER_PROMPT
            .replace('{{HISTORY}}', historyText)
            .replace('{{USER_INPUT}}', userInput)
            .replace('{{DOCTOR_CONTEXT}}', doctorContext);

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0,
        });

        const result = JSON.parse(response.choices[0].message.content);
        const stage = result.stage ? result.stage.trim().toUpperCase() : 'SYMPTOMS';

        // Validation: Fallback if LLM gives weird response
        const validStages = ['GREETING', 'SYMPTOMS', 'DOCTOR_ID', 'SCHEDULING', 'TOKEN_GENERATION'];
        return validStages.includes(stage) ? stage : 'SYMPTOMS';
    }
}

module.exports = StageAnalyzerAgent;
