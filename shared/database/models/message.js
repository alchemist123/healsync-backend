'use strict';
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        thread_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'assistant'),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'messages',
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Message.associate = (models) => {
        Message.belongsTo(models.Thread, { foreignKey: 'thread_id' });
    };

    return Message;
};
