import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from "nodemailer";

export async function sendMail(subject: string, body: string) {
  var transporter: Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  var mailOptions: SendMailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: `${
      process.env.NEXT_PUBLIC_APP_ENV === "staging"
        ? "siddeshsankhya@gmail.com"
        : "siddeshsankhya@gmail.com, pareenwriting@gmail.com"
    }`,
    subject: subject,
    text: body,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          console.log("Email Sent");
          resolve(true);
        }
      }
    );
  });
}
