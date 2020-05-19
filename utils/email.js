const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const mg = require("nodemailer-mailgun-transport");

module.exports = class Email {
  constructor(user, url) {
    this.from = `Muneeb Akram <${process.env.EMAIL_DOMAIN}>`;
    this.to = user.email;
    (this.url = url), (this.firstName = user.name.split(" ")[0]);
  }

  newTrasnport() {
    // if (process.env.NODE_ENV === "production") {
    //   const auth = {
    //     auth: {
    //       api_key: process.env.MAILGUN_KEY,
    //       domain: process.env.MAILGUN_DOMAIN,
    //     },
    //   };
    //   return nodemailer.createTransport(mg(auth));
    // }

    // if (process.env.NODE_ENV === "development") {
    // Create the transport and return it
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // }
  }

  async send(template, subject) {
    // 1) Generate HTML from pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define Mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      html,
      subject,
      text: htmlToText.fromString(html),
    };

    // 3) Send the email
    await this.newTrasnport().sendMail(mailOptions);
  }

  async sendWelome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Reset your password (valid only for 10min)"
    );
  }
};
