'use strict';
module.exports = (sequelize, DataTypes) => {
    const Summary = sequelize.define('Summary', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        threadId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        embedding: {
            type: DataTypes.VECTOR(1536),
            allowNull: true
        }
    }, {
        tableName: 'summaries',
        underscored: true
    });

    Summary.associate = (models) => {
        Summary.belongsTo(models.Thread, { foreignKey: 'threadId' });
    };

    return Summary;
};
