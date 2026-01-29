'use strict';

module.exports = (sequelize, DataTypes) => {
    const MedicalDocument = sequelize.define(
        'MedicalDocument',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            s3_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            consultation_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            document_type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            file_type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'image',
            },
            doctor_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            tableName: 'medical_documents',
            schema: 'consultation',
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );

    MedicalDocument.associate = (models) => {
        MedicalDocument.hasMany(models.Medicine, {
            foreignKey: 'document_id',
            as: 'medicines',
        });
    };

    return MedicalDocument;
};
