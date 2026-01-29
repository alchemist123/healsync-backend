const s3Service = require('../../shared/s3/s3.service');
const { MedicalDocument, Medicine, sequelize } = require('../../shared/database/models');
const prescriptionAgent = require('../agents/prescription.agent');
const fs = require('fs');

/**
 * Controller to handle medical document upload and processing
 */
const handleUpload = async (req, res) => {
    const { document_type, doctor_id, consultation_id } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!['prescription', 'x-ray', 'mri'].includes(document_type)) {
        return res.status(400).json({ error: 'Invalid document type. Must be prescription, x-ray, or mri' });
    }

    const transaction = await sequelize.transaction();

    try {
        // 1. Upload to S3
        const s3Url = await s3Service.uploadFile(file);

        // 2. Save Metadata to DB
        const medicalDoc = await MedicalDocument.create({
            s3_url: s3Url,
            consultation_id,
            document_type,
            file_type: 'image',
            doctor_id: parseInt(doctor_id)
        }, { transaction });

        // 3. If prescription, extract data
        let extractedMedicines = [];
        if (document_type === 'prescription') {
            extractedMedicines = await prescriptionAgent.extractMedicineData(s3Url);

            if (extractedMedicines && extractedMedicines.length > 0) {
                const medicineRecords = extractedMedicines.map(med => ({
                    medicine_name: med.medicine_name,
                    dosage: med.dosage,
                    intake_timing: med.intake_timing,
                    ingredients: med.ingredients,
                    document_id: medicalDoc.id
                }));

                await Medicine.bulkCreate(medicineRecords, { transaction });
            }
        }

        await transaction.commit();

        // Cleanup local temp file
        fs.unlinkSync(file.path);

        res.status(201).json({
            success: true,
            message: 'Document uploaded and processed successfully',
            data: {
                id: medicalDoc.id,
                s3_url: s3Url,
                document_type,
                medicines: extractedMedicines
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Upload Process Error:', error);

        // Cleanup local temp file on error
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.status(500).json({ error: 'An error occurred during upload processing' });
    }
};

module.exports = {
    handleUpload
};
