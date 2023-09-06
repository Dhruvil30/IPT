const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();

const INPUT_BUCKET_NAME = process.env.INPUT_BUCKET_NAME;

exports.lambdaHandler = async (event) => {
    try {
        const { key, email } = event;

        const response = await rekognition.detectLabels({
            Image: {
                S3Object: {
                    Bucket: INPUT_BUCKET_NAME,
                    Name: key
                }
            },
            MaxLabels: 10,
            MinConfidence: 70
        }).promise();

        const labels = response.Labels.map(label => {
            return {
                Name: label.Name,
                Confidence: label.Confidence
            };
        });

        return {
            statusCode: 200,
            body: {
                message: 'Labels detected successfully.',
                labels: labels,
                email
            }
        };
    } catch (error) {
        console.error('Error in DetectLabelsLambda function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to detect labels for the image' })
        };
    }
};
