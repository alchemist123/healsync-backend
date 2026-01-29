'use strict';
module.exports = (sequelize, DataTypes) => {
    const Thread = sequelize.define('Thread', {
        thread_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        patient_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'completed'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'threads',
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Thread.associate = (models) => {
        Thread.hasMany(models.Message, { foreignKey: 'thread_id' });
        Thread.hasMany(models.Summary, { foreignKey: 'thread_id' });
        Thread.hasOne(models.Token, { foreignKey: 'thread_id' });
    };

    return Thread;
};
