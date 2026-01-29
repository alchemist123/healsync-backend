'use strict';

module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        'Message',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            thread_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('user', 'assistant'),
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            tableName: 'messages',
            schema: 'public',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    Message.associate = (models) => {
        Message.belongsTo(models.Thread, {
            foreignKey: 'thread_id',
            as: 'thread',
        });
    };

    return Message;
};
