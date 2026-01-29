'use strict';
module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define('Token', {
        token_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        token_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        thread_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        issued_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        queue_position: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        estimated_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        actual_time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'tokens',
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Token.associate = (models) => {
        Token.belongsTo(models.Thread, { foreignKey: 'thread_id' });
    };

    return Token;
};
