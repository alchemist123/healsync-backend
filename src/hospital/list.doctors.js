const { Doctor, HospitalDepartmentDoctor } = require('@shared/database/models');
const logger = require('@shared/utilities/logger');

function normalizeUUID(value) {
  if (value == null || typeof value !== 'string') return value;
  return value.trim().replace(/^["']|["']$/g, '');
}

module.exports = async (req, res) => {
  try {
    const raw = req.query?.institution_id;
    const institution_id = raw ? normalizeUUID(raw) : null;

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
      const result = Array.from(doctorMap.values());
      return res.json({ doctors: result });
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

    const result = doctors.map((d) => {
      const doc = d.toJSON();
      doc.joined_departments = (doc.hospitalDepartmentDoctors || []).map((hdd) => ({
        hospital_id: hdd.hospital_id,
        department: hdd.department,
      }));
      delete doc.hospitalDepartmentDoctors;
      return doc;
    });

    return res.json({ doctors: result });
  } catch (error) {
    logger.error('hospital list doctors error', { error: error?.message, stack: error?.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
