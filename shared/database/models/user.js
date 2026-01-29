'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_type: {
        type: DataTypes.ENUM('admin', 'doctor', 'patient'),
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      schema: 'public',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  User.associate = (models) => {
    User.hasMany(models.Patient, {
      foreignKey: 'user_id',
      as: 'patients',
    });
  };

  return User;
};
