const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const SQS = new AWS.SQS();
const crypto = require('crypto');

const BUCKET_NAME = process.env.INPUT_BUCKET_NAME;
const QUEUE_URL = process.env.SQS_QUEUE_URL;

exports.lambdaHandler = async (event) => {
    try {
        const eventBody = JSON.parse(event.body);
        const fileContent = Buffer.from(eventBody.file, 'base64');
        const { email, imageType, toType, operation, width, height } = eventBody;

        if (
            !["png", "jpeg"].includes(imageType)
            || (operation === 'convert' && !["png", "jpeg"].includes(toType))
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid image type' })
            };
        }

        if (!["convert", "resize", "compress", "analyze"].includes(operation)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid operation type' })
            };
        }

        const fileExtension = `.${imageType}`;
        const randomFileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;

        const messageBody = {
            email,
            imageType,
            toType,
            operation,
            width,
            height,
            key: randomFileName
        }

        await s3.putObject({
            Bucket: BUCKET_NAME,
            Key: randomFileName,
            Body: fileContent
        }).promise();

        await SQS.sendMessage({
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: QUEUE_URL
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File upload successful and added to processing queue.'
            })
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error: ${error}`
            })
        };
    }
};
