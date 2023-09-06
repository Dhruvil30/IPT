const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();
const sqs = new AWS.SQS();

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN;

// const QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/292597057072/ImageProcessingQueue';
// const STATE_MACHINE_ARN = 'arn:aws:states:us-east-1:292597057072:stateMachine:TP';

exports.lambdaHandler = async (event) => {
    if (!event.Records || event.Records.length === 0) {
        console.log('No messages to process.');
        return;
    }

    const sqsMessage = event.Records[0];

    const params = {
        stateMachineArn: STATE_MACHINE_ARN,
        input: sqsMessage.body,
        name: `Execution-${Date.now()}`
    };

    try {
        await stepfunctions.startExecution(params).promise();

        const deleteParams = {
            QueueUrl: QUEUE_URL,
            ReceiptHandle: sqsMessage.receiptHandle
        };
        await sqs.deleteMessage(deleteParams).promise();

    } catch (error) {
        console.error(`Error processing the message: ${error.message}`);
        throw error;
    }
};
