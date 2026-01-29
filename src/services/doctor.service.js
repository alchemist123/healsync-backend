/**
 * Service to handle doctor schedules and matching
 */
class DoctorService {
    /**
     * Get available schedules for the current week
     */
    async getAvailableSchedules() {
        // Dummy data using snake_case for consistency with DB schema
        return [
            {
                schedule_id: 1,
                doctor_id: 101,
                doctor_name: "Dr. Smith",
                department: "Cardiology",
                day_of_week: "Monday",
                start_time: "09:00",
                end_time: "13:00",
                specialty: "Heart related issues, chest pain, hypertension"
            },
            {
                schedule_id: 2,
                doctor_id: 102,
                doctor_name: "Dr. Jones",
                department: "Dermatology",
                day_of_week: "Tuesday",
                start_time: "10:00",
                end_time: "14:00",
                specialty: "Skin issues, rashes, allergies"
            },
            {
                schedule_id: 3,
                doctor_id: 103,
                doctor_name: "Dr. Williams",
                department: "Neurology",
                day_of_week: "Wednesday",
                start_time: "11:00",
                end_time: "15:00",
                specialty: "Headaches, migraines, nerve issues"
            },
            {
                schedule_id: 4,
                doctor_id: 104,
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
