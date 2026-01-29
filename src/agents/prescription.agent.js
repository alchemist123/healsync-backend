const openai = require('./llm/openai');

/**
 * Agent to extract medicine details from prescription images
 */
class PrescriptionExtractionAgent {

    /**
     * Extracts medicine data from a base64 encoded image
     * @param {string} base64Data - The pure base64 string
     * @param {string} mimeType - The file mime type (e.g. 'image/jpeg')
     */
    async extractMedicineData(base64Data, mimeType) {

        const prompt = `
You are a medical prescription extraction assistant.

Your task is to extract all medicine details from the given prescription image.

Return the response strictly as a valid JSON object in the following format:

{
  "medicines": [
    {
      "medicine_name": "Full medicine name",
      "dosage": "Strength + frequency (example: 500mg twice daily)",
      
      "intake_timing": {
        "breakfast": {
          "before": true/false,
          "after": true/false
        },
        "lunch": {
          "before": true/false,
          "after": true/false
        },
        "dinner": {
          "before": true/false,
          "after": true/false
        }
      },

      "ingredients": "Main active ingredient"
    }
  ]
}

### Rules:
- intake_timing MUST always be in the JSON structure above.
- Do not return any text explanation, only JSON.
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content);

            return result.medicines || [];

        } catch (error) {
            console.error("Prescription Extraction Error:", error);
            return [];
        }
    }
}

module.exports = new PrescriptionExtractionAgent();
