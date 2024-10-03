const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const { PassThrough } = require('stream');

// Configure AWS S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Set up multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(), // This stores the file in memory temporarily, adjust as needed
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit to 50 MB
});

// Upload function with streaming to S3
const uploadFile = async (req, res) => {
    const bucketName = req.body.bucket;
    const folderName = req.body.folder;
    const publicRead = req.body.publicRead === 'true';

    // Validate bucket name, folder name, and file
    if (!bucketName) {
        return res.status(400).json({ error: 'Bucket name is required' });
    }

    if (!folderName) {
        return res.status(400).json({ error: 'Folder name is required' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'File is required' });
    }

    // Sanitize the original filename
    const sanitizedFilename = req.file.originalname.replace(/\s+/g, '_');

    // Create a PassThrough stream to pipe the file buffer to S3
    const passThroughStream = new PassThrough();
    passThroughStream.end(req.file.buffer); // Write the file buffer to the stream

    // Set up upload parameters using the stream
    const uploadParams = {
        Bucket: bucketName,
        Key: `${folderName}/${sanitizedFilename}`, // Use the sanitized filename
        Body: passThroughStream, // Use the stream instead of the file buffer
        ContentType: req.file.mimetype,
        ACL: publicRead ? 'public-read' : undefined,
    };

    try {
        // Perform multipart upload using @aws-sdk/lib-storage
        const parallelUpload = new Upload({
            client: s3Client,
            params: uploadParams,
            leavePartsOnError: false, // Automatically clean up parts on failure
            partSize: 5 * 1024 * 1024, // 5MB part size for multipart uploads
            queueSize: 5, // Concurrent uploads
        });

        parallelUpload.on('httpUploadProgress', (progress) => {
            console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
        });

        const data = await parallelUpload.done();
        res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Middleware to handle file upload
const uploadMiddleware = upload.single('file');

module.exports = {
    uploadFile,
    uploadMiddleware,
};
