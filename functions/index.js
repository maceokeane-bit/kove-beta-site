const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;
const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;
const fromEmail = process.env.CONTACT_FROM_EMAIL;

exports.notifyOnContactSubmission = onDocumentCreated(
  "contactSubmissions/{submissionId}",
  async (event) => {
    const submission = event.data?.data();

    if (!submission) {
      logger.warn("Missing contact submission data.");
      return;
    }

    if (!resendApiKey || !notificationEmail || !fromEmail) {
      logger.warn("Email settings are incomplete. Skipping notification.");
      return;
    }

    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: fromEmail,
      to: notificationEmail,
      subject: "New Kove campus beta question",
      replyTo: submission.email,
      text: [
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        "",
        submission.message,
      ].join("\n"),
    });
  },
);
