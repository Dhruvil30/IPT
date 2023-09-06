const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const Jimp = require('jimp');

const INPUT_BUCKET_NAME = process.env.INPUT_BUCKET_NAME;
const OUTPUT_BUCKET_NAME = process.env.OUTPUT_BUCKET_NAME;
const URL_EXPIRATION = 3600;

exports.lambdaHandler = async (event) => {
    try {
        const { key, width, height, email } = event;

        const s3Data = await s3.getObject({
            Bucket: INPUT_BUCKET_NAME,
            Key: key
        }).promise();

        const imageBuffer = s3Data.Body;
        const image = await Jimp.read(imageBuffer);

        const resizedBuffer = await image.resize(width, height).getBufferAsync(Jimp.AUTO);

        const outputKey = `${key.replace(/\..+$/, '')}-resized.jpg`;

        await s3.putObject({
            Bucket: OUTPUT_BUCKET_NAME,
            Key: outputKey,
            Body: resizedBuffer
        }).promise();

        const presignedUrl = s3.getSignedUrl('getObject', {
            Bucket: OUTPUT_BUCKET_NAME,
            Key: outputKey,
            Expires: URL_EXPIRATION
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image resizing successful.',
                url: presignedUrl,
                email
            })
        };
    } catch (error) {
        console.error('Error in resizeImage function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to resize image' })
        };
    }
};
