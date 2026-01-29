'use strict';

module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qualification: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      license_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      experience: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'doctors',
      schema: 'hospital',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Doctor.hasMany(models.HospitalDepartmentDoctor, {
      foreignKey: 'doctor_id',
      as: 'hospitalDepartmentDoctors',
    });
  };

  return Doctor;
};
