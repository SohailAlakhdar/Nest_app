import { BadRequestException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.to) {
    throw new BadRequestException('Recipient email address is required');
  }
  if (!data.html && !data.text && !data.attachments?.length) {
    throw new BadRequestException(
      'Either HTML or plain text content is required',
    );
  }
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: process.env.APP_GMAIL as string,
      pass: process.env.APP_PASSWORD as string,
    },
  });
  const info = await transporter.sendMail({
    ...data,
    from: ` ${process.env.APP_NAME} <${process.env.APP_GMAIL}>`,
  });
  console.log('Email sent:', info.messageId);
};
