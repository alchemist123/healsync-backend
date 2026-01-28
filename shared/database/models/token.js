'use strict';
module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define('Token', {
        tokenId: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        tokenNumber: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        threadId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        appointmentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        issuedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending'
        },
        queuePosition: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        estimatedTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        actualTime: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'tokens',
        underscored: true
    });

    Token.associate = (models) => {
        Token.belongsTo(models.Thread, { foreignKey: 'threadId' });
    };

    return Token;
};
