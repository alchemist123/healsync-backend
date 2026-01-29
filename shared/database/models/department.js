'use strict';

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'departments',
      schema: 'public',
      underscored: true,
      timestamps: false,
    },
  );

  Department.associate = (models) => {
    Department.hasMany(models.Doctor, {
      foreignKey: 'department_id',
      as: 'doctors',
    });
    Department.hasMany(models.HospitalDepartmentDoctor, {
      foreignKey: 'department_id',
      as: 'hospitalDepartmentDoctors',
    });
  };

  return Department;
};
