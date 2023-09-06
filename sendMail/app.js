const nodemailer = require('nodemailer');

exports.lambdaHandler = async (event) => {
    const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    let mailOptions;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'dhruvilpatel222000@gmail.com',
            pass: 'zrlogtpzbnvrzbpz',
        },
    });

    if (eventBody.url) {
        const s3Url = eventBody.url;

        mailOptions = {
            from: 'dhruvilpatel222000@gmail.com',
            to: eventBody.email,
            subject: 'Image Processing Result',
            text: `Image conversion was successful. You can view the processed image here: ${s3Url}`,
            html: `<p>Image conversion was successful. You can view the processed image here: <a href="${s3Url}">View Image</a></p>`
        };
    } else if (eventBody.labels) {
        const labelsList = eventBody.labels.map(label => `<li>${label.Name} (${label.Confidence.toFixed(2)}% confidence)</li>`).join('');
        mailOptions = {
            from: 'dhruvilpatel222000@gmail.com',
            to: eventBody.email,
            subject: 'Labels Detection Result',
            text: `Labels detected successfully. Here are the detected labels: ${eventBody.labels.map(label => `${label.Name}`).join(', ')}`,
            html: `<p>Labels detected successfully. Here are the detected labels:</p><ul>${labelsList}</ul>`
        };
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid input format.' }),
        };
    }

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!' }),
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send email.', error: error.message }),
        };
    }
};
