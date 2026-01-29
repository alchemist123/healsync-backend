const { HospitalDepartmentDoctor } = require('@shared/database/models'); 
module.exports = async (institution_id, department_id, doctor_id) => {


if (!Array.isArray(department_id)) {
  throw new Error('department_id must be an array');
}

const createdMappings = [];

for (const deptId of department_id) {
  // Check if the mapping already exists
  const exists = await HospitalDepartmentDoctor.findOne({
    where: {
      hospital_id: institution_id,
      department_id: deptId,
      doctor_id,
    }
  });

  // If not exists, create the mapping
  if (!exists) {
    const mapping = await HospitalDepartmentDoctor.create({
      hospital_id: institution_id,
      department_id: deptId,
      doctor_id
    });
    createdMappings.push(mapping);
  }
}

return createdMappings;
};