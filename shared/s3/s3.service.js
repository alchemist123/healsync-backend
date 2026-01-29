const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

class S3Service {
    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async uploadFile(file) {
        const fileContent = fs.readFileSync(file.path);
        const fileName = `${Date.now()}_${file.originalname}`;

        const params = {
            Bucket: this.bucketName,
            Key: fileName,
            Body: fileContent,
            ContentType: file.mimetype,
        };

        try {
            await this.client.send(new PutObjectCommand(params));
            // Assuming the bucket is public-read or using a CloudFront URL
            // Adjust based on user's actual S3 setup
            return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        } catch (error) {
            console.error("S3 Upload Error:", error);
            throw error;
        }
    }
}

module.exports = new S3Service();
