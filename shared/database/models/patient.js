'use strict';

module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
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

      middle_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      year_of_birth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      month_of_birth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      day_of_birth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      gender: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      emergency_contact: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },

      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      blood_group: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },

      abha_address: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      abha_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      tableName: 'patient',
      schema: 'patients',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  Patient.associate = (models) => {
    Patient.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Patient.hasMany(models.Token, {
      foreignKey: 'patient_id',
      as: 'tokens',
    });

  };

  return Patient;
};
