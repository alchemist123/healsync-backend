const openai = require('./llm/openai');

/**
 * Agent to extract medicine details from prescription images
 */
class PrescriptionExtractionAgent {
    async extractMedicineData(imageUrl) {
        const prompt = `
            Extract medicine information from the provided prescription image.
            Return the data as a JSON array of objects with the following keys:
            - medicine_name: Full name of the medicine.
            - dosage: Strength/concentration (e.g., 500mg) and frequency.
            - intake_timing: When to take it (e.g., Before Breakfast, After Dinner).
            - ingredients: Main active components (e.g., Paracetamol).

            Format the response as a valid JSON array only.
        `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", // Using GPT-4o for its vision capabilities
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: { url: imageUrl },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" },
            });

            const result = JSON.parse(response.choices[0].message.content);
            return result.medicines || []; // Expecting { "medicines": [...] }
        } catch (error) {
            console.error("Prescription Extraction Error:", error);
            return [];
        }
    }
}

module.exports = new PrescriptionExtractionAgent();
