/**
 * Service to handle doctor schedules and matching
 */
const { v4: uuidv4 } = require('uuid');

class DoctorService {
    /**
     * Get available schedules for the current week
     */
    async getAvailableSchedules() {
        // Dummy data using snake_case and UUIDs for consistency
        return [
            {
                schedule_id: '8097d81a-6419-4813-81b4-21952e420959',
                doctor_id: 'd9e075ea-16f3-470a-bd62-13a8862f92f2',
                doctor_name: "Dr. Smith",
                department: "Cardiology",
                day_of_week: "Monday",
                start_time: "09:00",
                end_time: "13:00",
                specialty: "Heart related issues, chest pain, hypertension"
            },
            {
                schedule_id: '96b864a6-77e8-48f8-86d1-678564758712',
                doctor_id: 'f93d489b-735a-406c-829d-649033626e2e',
                doctor_name: "Dr. Jones",
                department: "Dermatology",
                day_of_week: "Tuesday",
                start_time: "10:00",
                end_time: "14:00",
                specialty: "Skin issues, rashes, allergies"
            },
            {
                schedule_id: '307f5968-3868-450f-a3cf-bc0106a782b1',
                doctor_id: '7c6f0e4b-6e9d-4e2b-8a8f-5c2d3b4a5e6f',
                doctor_name: "Dr. Williams",
                department: "Neurology",
                day_of_week: "Wednesday",
                start_time: "11:00",
                end_time: "15:00",
                specialty: "Headaches, migraines, nerve issues"
            },
            {
                schedule_id: 'a69363bc-089c-4861-841f-817812903423',
                doctor_id: 'e1d2c3b4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
                doctor_name: "Dr. Brown",
                department: "General Medicine",
                day_of_week: "Thursday",
                start_time: "08:00",
                end_time: "12:00",
                specialty: "Fever, cold, general weakness, routine checkups"
            }
        ];
    }

    /**
     * Format schedules for LLM context
     */
    async getSchedulesForPrompt() {
        const schedules = await this.getAvailableSchedules();
        return schedules.map(s =>
            `- [Doctor ID: ${s.doctor_id}] ${s.doctor_name} (${s.department}): Specialized in ${s.specialty}. Available on ${s.day_of_week} ${s.start_time}-${s.end_time}`
        ).join('\n');
    }
}

module.exports = new DoctorService();
