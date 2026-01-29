const openai = require('./llm/openai');

class SummarizerAgent {

    static async summarize(messages) {
        const prompt = `
      Summarize the following medical chat messages into a concise memory chunk.
      Focus on symptoms reported, procedures discussed, and status of prerequisites.
      Use gpt-4o-mini.
      
      Messages:
      ${JSON.stringify(messages)}
    `;

        const response = await openai.chat.completions.create({
            model: process.env.OPEN_AI_MODEL || 'gpt-4o-mini',
            messages: [{ role: 'system', content: prompt }],
        });

        return response.choices[0].message.content;
    }
}

module.exports = SummarizerAgent;
