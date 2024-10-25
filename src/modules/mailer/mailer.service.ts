import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}
  async sendEmail(
    type: string,
    to: string,
    username: string,
    confirmationLink: string,
  ): Promise<boolean> {
    try {
      const templateData = await this.getTemplate(type);
      await this.mailService.sendMail({
        to,
        subject: templateData.subject,
        template: templateData.template,
        context: {
          username,
          confirmationLink,
        },
      });
      console.log(`${type} sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`Error sending ${type} to ${to}:`, error);
      throw new Error(`Failed to send ${type} to ${to}`);
    }
  }
  private async getTemplate(
    type: string,
  ): Promise<{ template: string; subject: string }> {
    const types = {
      emailVerification: {
        subject: 'Email Verification',
        template: './email-verification',
      },
      forgotPassword: {
        subject: 'Reset Password',
        template: './forgot-password',
      },
      passwordResetConfirmation: {
        subject: 'Password Telah Diubah',
        template: './password-reset-confirmation',
      },
    };
    const { subject, template } = types[type];
    return { subject, template };
  }
}
