'use strict';

module.exports = (sequelize, DataTypes) => {
  const HospitalDepartmentDoctor = sequelize.define(
    'HospitalDepartmentDoctor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      hospital_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      doctor_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'hospital_department_doctor',
      schema: 'public',
      underscored: true,
      timestamps: false,
    },
  );

  HospitalDepartmentDoctor.associate = (models) => {
    HospitalDepartmentDoctor.belongsTo(models.HealthcareInstitution, {
      foreignKey: 'hospital_id',
      as: 'hospital',
    });
    HospitalDepartmentDoctor.belongsTo(models.Department, {
      foreignKey: 'department_id',
      as: 'department',
    });
    HospitalDepartmentDoctor.belongsTo(models.Doctor, {
      foreignKey: 'doctor_id',
      as: 'doctor',
    });
  };

  return HospitalDepartmentDoctor;
};
