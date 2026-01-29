'use strict';

module.exports = (sequelize, DataTypes) => {
    const Thread = sequelize.define(
        'Thread',
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
            status: {
                type: DataTypes.ENUM('active', 'completed'),
                defaultValue: 'active',
            },
        },
        {
            tableName: 'threads',
            schema: 'public',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    Thread.associate = (models) => {
        Thread.hasMany(models.Message, {
            foreignKey: 'thread_id',
            as: 'messages',
        });
        Thread.hasMany(models.Summary, {
            foreignKey: 'thread_id',
            as: 'summaries',
        });
        Thread.hasOne(models.Token, {
            foreignKey: 'thread_id',
            as: 'token',
        });
        Thread.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return Thread;
};
