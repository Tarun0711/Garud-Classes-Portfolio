const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');

// Simple logger (replace with your own if needed)
const logger = { 
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  debug: (...args) => console.debug('[DEBUG]', ...args)
};

class EmailService {
  constructor() {
    this.templates = {};
    this.transporter = this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      let transporter = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      transporter.verify((error) => {
        if (error) {
          if (error.code === 'EAUTH' || error.responseCode === 535) {
            logger.error(
              '❌ Gmail SMTP login failed.\n' +
              'Possible causes:\n' +
              '1. You are using your normal Gmail password (use a 16-character App Password instead)\n' +
              '2. 2-Step Verification is not enabled on your Google account\n' +
              '3. Your SMTP_USER or SMTP_PASS in .env is wrong\n' +
              '👉 Fix: https://support.google.com/mail/?p=BadCredentials'
            );
          } else {
            logger.error('Email service verification failed:', error);
          }
        } else {
          logger.info('✅ Email service is ready to send emails');
        }
      });

      return transporter;
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      throw error;
    }
  }

  async loadTemplate(templateName) {
    try {
      if (this.templates[templateName]) {
        return this.templates[templateName];
      }

      const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateContent);

      this.templates[templateName] = template;
      return template;
    } catch (error) {
      logger.error(`Failed to load email template ${templateName}:`, error);
      throw error;
    }
  }
 
  async sendEmail({ to, subject, template, context, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const templateFn = await this.loadTemplate(template);
      const html = templateFn(context);

      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
      });

      logger.info(`📩 Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        logger.error(
          `❌ Failed to send email to ${to} due to Gmail authentication error.\n` +
          'Make sure you:\n' +
          '1. Enabled 2-Step Verification\n' +
          '2. Generated and used a 16-character Gmail App Password\n' +
          '3. Correctly set SMTP_USER & SMTP_PASS in your .env\n'
        );
      } else {
        logger.error(`Failed to send email to ${to}:`, error);
      }
      return { success: false, error: error.message };
    }
  }

  async sendCustomEmail(to, subject, html, attachments = []) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const info = await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
      });

      logger.info(`📩 Custom email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        logger.error(
          `❌ Failed to send custom email to ${to} due to Gmail authentication error.\n` +
          'Make sure you:\n' +
          '1. Enabled 2-Step Verification\n' +
          '2. Generated and used a 16-character Gmail App Password\n' +
          '3. Correctly set SMTP_USER & SMTP_PASS in your .env\n'
        );
      } else {
        logger.error(`Failed to send custom email to ${to}:`, error);
      }
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const emailService = new EmailService();

// Export both the service instance and individual functions for backward compatibility
module.exports = {
  sendEmail: (to, template, context) => emailService.sendEmail({ to, template, context }),
  sendCustomEmail: (to, subject, html) => emailService.sendCustomEmail(to, subject, html),
  emailService
};
