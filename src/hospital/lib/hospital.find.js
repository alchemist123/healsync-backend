const { HealthcareInstitution } = require('@shared/database/models');

module.exports = async (user_id) => {
  try {
    return await HealthcareInstitution.findOne({
      where: { user_id },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
