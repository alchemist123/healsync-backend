'use strict';

module.exports = (sequelize, DataTypes) => {
  const HospitalUserMapping = sequelize.define(
    'HospitalUserMapping',
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'hospital_user_mappings',
      schema: 'public',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  HospitalUserMapping.associate = (models) => {
    HospitalUserMapping.belongsTo(models.HealthcareInstitution, {
      foreignKey: 'hospital_id',
      as: 'hospital',
    });
    HospitalUserMapping.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return HospitalUserMapping;
};
