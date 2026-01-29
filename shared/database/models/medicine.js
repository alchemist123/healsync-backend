'use strict';

module.exports = (sequelize, DataTypes) => {
    const Medicine = sequelize.define(
        'Medicine',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            medicine_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            dosage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            intake_timing: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            ingredients: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            document_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            tableName: 'medicines',
            schema: 'consultation',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    Medicine.associate = (models) => {
        Medicine.belongsTo(models.MedicalDocument, {
            foreignKey: 'document_id',
            as: 'medical_document',
        });
    };

    return Medicine;
};
