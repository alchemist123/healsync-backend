'use strict';

module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define(
        'Token',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            token_number: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            thread_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            appointment_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            patient_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            issued_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: 'pending',
            },
            queue_position: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            estimated_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            actual_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            doctor_id: {
                type: DataTypes.UUID,
                allowNull: true,
            },
        },
        {
            tableName: 'tokens',
            schema: 'public',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    Token.associate = (models) => {
        Token.belongsTo(models.Thread, {
            foreignKey: 'thread_id',
            as: 'thread',
        });
        // Token.belongsTo(models.Patient, { foreignKey: 'patient_id', as: 'patient' });
        // Token.belongsTo(models.User, { foreignKey: 'doctor_id', as: 'doctor' });
    };

    return Token;
};
