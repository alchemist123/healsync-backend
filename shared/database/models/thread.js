'use strict';
module.exports = (sequelize, DataTypes) => {
    const Thread = sequelize.define('Thread', {
        threadId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        patientId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'completed'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'threads',
        underscored: true
    });

    Thread.associate = (models) => {
        Thread.hasMany(models.Message, { foreignKey: 'threadId' });
        Thread.hasMany(models.Summary, { foreignKey: 'threadId' });
        Thread.hasOne(models.Token, { foreignKey: 'threadId' });
    };

    return Thread;
};
