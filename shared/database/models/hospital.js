'use strict';

module.exports = (sequelize, DataTypes) => {
  const HealthcareInstitution = sequelize.define(
    'HealthcareInstitution',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      institution_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      institution_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      license_number: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'healthcare_institutions',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return HealthcareInstitution;
};
