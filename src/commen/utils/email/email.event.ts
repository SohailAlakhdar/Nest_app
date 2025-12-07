import { EventEmitter } from 'node:events';
import { sendEmail } from '../email/send.email';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from './templates/verify.templete';
import { otpEnum } from 'src/commen/enums';

export interface IEmail extends Mail.Options {
  otp: string;
}
export const emailEvent = new EventEmitter();

//  Confirm_Email
emailEvent.on(otpEnum.ConfirmEmail, (data: IEmail) => {
  void (async () => {
    try {
      data.subject = otpEnum.ConfirmEmail;
      data.html = verifyEmailTemplate({ otp: String(data.otp) });
      await sendEmail(data);
    } catch (err) {
      console.error('Error sending email (ConfirmEmail):', err);
    }
  })();
});
// Reset_Password
emailEvent.on(otpEnum.ResetPassword, (data: IEmail) => {
  void (async () => {
    try {
      data.html = verifyEmailTemplate({ otp: String(data.otp) });
      data.subject = otpEnum.ResetPassword;
      await sendEmail(data);
    } catch (err) {
      console.error('Error sending email (resetPassword):', err);
    }
  })();
});
