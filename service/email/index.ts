import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from "nodemailer";

export async function sendMail(subject: string, body: any) {
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
      process.env.NEXT_PUBLIC_APP_ENV === "prod"
        ? "siddeshsankhya@gmail.com, pareenwriting@gmail.com"
        : "siddeshsankhya@gmail.com"
    }`,
    subject: subject,
    html: body,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      mailOptions,
      (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve(true);
        }
      }
    );
  });
}
export const generateEmailHTML = ({
  action,
  fid,
  email,
  twitter,
  generatedValues,
  source,
  spectrum,
  mintedValues,
}: {
  action: "NEW_USER" | "USER_VALUES_GENERATED" | "USER_VALUES_MINTED";
  fid?: string;
  email?: string;
  twitter?: string;
  generatedValues?: string[];
  source?: string;
  spectrum?: any;
  mintedValues?: any[];
}) => {
  switch (action) {
    case "USER_VALUES_GENERATED":
      return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; width:100%">
                <h2 style="color: #0056b3;">User Values Generated</h2>
                <p><strong>Source:</strong> ${source}</p>
                ${fid ? `<p><strong>Farcaster ID:</strong> ${fid}</p>` : ""}
                ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""} 
                ${
                  twitter
                    ? `<p><strong>Twitter ID:</strong> ${twitter}</p>`
                    : ""
                }
                <h3>User Values</h3>    
                ${
                  generatedValues &&
                  generatedValues.map((value) => {
                    return `<span style="background-color: #f9f9f9; color: #333; padding: 5px; border: 1px solid #ddd; border-radius: 5px; margin: 2px; display: inline-block;">${value}</span>`;
                  })
                }

                <h3>User Spectrum</h3>
                ${spectrum.map(
                  (spectrum: any) =>
                    `<span style="background-color: #f9f9f9; color: #333; padding: 5px; border: 1px solid #ddd; border-radius: 5px; margin: 2px; display: inline-block;">${
                      spectrum.name
                    } - ${100 - Number(spectrum.score)}</span>`
                )}
              </div>`;
    case "NEW_USER":
      return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; width:100%">
                  <h2 style="color: #0056b3;">New user signed up</h2>
                  ${fid ? `<p><strong>Farcaster ID:</strong> ${fid}</p>` : ""}
                  ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""} 
          
                </div>`;

    case "USER_VALUES_MINTED":
      return `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; width:100%">
                            <h2 style="color: #0056b3;">User Values Minted</h2>
      
                            ${
                              fid
                                ? `<p><strong>Farcaster ID:</strong> ${fid}</p>`
                                : ""
                            }
                            ${
                              email
                                ? `<p><strong>Email:</strong> ${email}</p>`
                                : ""
                            } 
                          
                            <h3>User Values</h3>    
                            ${
                              mintedValues &&
                              mintedValues.map((value) => {
                                return `<span style="background-color: #f9f9f9; color: #333; padding: 5px; border: 1px solid #ddd; border-radius: 5px; margin: 2px; display: inline-block;">${value}</span>`;
                              })
                            }
                          </div>`;

    default:
      return "";
  }
};
