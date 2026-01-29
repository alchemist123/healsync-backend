'use strict';

/** @param {import('sequelize').Sequelize} sequelize */
/** @param {import('sequelize').DataTypes} DataTypes */
module.exports = (sequelize, DataTypes) => {
  const HospitalUserMapping = sequelize.define(
    'HospitalUserMapping',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hospital_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
  );

  return HospitalUserMapping;
};
