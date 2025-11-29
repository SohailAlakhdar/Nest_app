import { EventEmitter } from 'node:events';
import { sendEmail } from '../email/send.email';
import Mail from 'nodemailer/lib/mailer';
import { verifyEmailTemplate } from './templates/verify.templete';

export interface IEmail extends Mail.Options {
  otp: string;
}
export const emailEvent = new EventEmitter();
emailEvent.on('ConfirmEmail', (data: IEmail) => {
  void (async () => {
    try {
      data.html = verifyEmailTemplate({ otp: String(data.otp) });
      data.subject = 'Confirm your email';
      await sendEmail(data);
    } catch (err) {
      console.error('Error sending email (ConfirmEmail):', err);
    }
  })();
});

emailEvent.on('resetPassword', (data: IEmail) => {
  void (async () => {
    try {
      data.html = verifyEmailTemplate({ otp: String(data.otp) });
      data.subject = 'Reset your password';
      await sendEmail(data);
    } catch (err) {
      console.error('Error sending email (resetPassword):', err);
    }
  })();
});
