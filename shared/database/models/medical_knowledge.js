'use strict';
module.exports = (sequelize, DataTypes) => {
    const MedicalKnowledge = sequelize.define('MedicalKnowledge', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
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
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'medical_knowledge',
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return MedicalKnowledge;
};
