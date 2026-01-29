'use strict';

const { Doctor, HospitalDepartmentDoctor } = require('../../../shared/database/models');

/**
 * List doctors, optionally filtered by institution_id
 * @param {string|null} institution_id - The ID of the institution to filter by
 */
module.exports = async (institution_id = null) => {
    if (institution_id) {
        // Get from mapping table: HospitalDepartmentDoctor for this institution, join doctor + department
        const mappings = await HospitalDepartmentDoctor.findAll({
            where: { hospital_id: institution_id },
            include: [
                {
                    association: 'doctor',
                    include: [
                        {
                            association: 'user',
                            attributes: ['id', 'phone', 'aadhaar_number', 'user_type'],
                        },
                    ],
                },
                {
                    association: 'department',
                    attributes: ['id', 'name'],
                },
            ],
        });

        // Group by doctor (a doctor can be in multiple departments at same institution)
        const doctorMap = new Map();
        for (const m of mappings) {
            const row = m.toJSON();
            const doctorId = row.doctor?.id;
            if (!doctorId) continue;
            if (!doctorMap.has(doctorId)) {
                doctorMap.set(doctorId, {
                    ...row.doctor,
                    joined_departments: [],
                });
            }
            const doc = doctorMap.get(doctorId);
            doc.joined_departments.push({
                hospital_id: row.hospital_id,
                department: row.department,
            });
        }
        return Array.from(doctorMap.values());
    }

    // No institution_id: get from doctor table with user and all joined departments
    const doctors = await Doctor.findAll({
        order: [['created_at', 'DESC']],
        include: [
            {
                association: 'user',
                attributes: ['id', 'phone', 'aadhaar_number', 'user_type'],
            },
            {
                association: 'hospitalDepartmentDoctors',
                attributes: ['id', 'hospital_id', 'department_id'],
                include: [
                    {
                        association: 'department',
                        attributes: ['id', 'name'],
                    },
                ],
            },
        ],
    });

    return doctors.map((d) => {
        const doc = d.toJSON();
        doc.joined_departments = (doc.hospitalDepartmentDoctors || []).map((hdd) => ({
            hospital_id: hdd.hospital_id,
            department: hdd.department,
        }));
        delete doc.hospitalDepartmentDoctors;
        return doc;
    });
};
