'use strict';

const Helper = require("sendgrid").mail;
const sg = require('sendgrid')(process.env.SEND_GRID_API_KEY || "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");
const Logger = require('./logger');

module.exports.sendMail = sendMail;

function sendMail(from, to, subject, content) {

    let fromEmail = new Helper.Email(from);
    let toEmail = new Helper.Email(to);
    let emailContent = new Helper.Content("text/html", content);
    let mail = new Helper.Mail(fromEmail, subject, toEmail, emailContent);

    let isEmailSent = false;

    let request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
    });

    sg.API(request, function (err, response) {

        if (err) {
            Logger.log("err in sendgrid: ", err);
            isEmailSent = false;
        }

        Logger.log("sendgrid body:", response.statusCode);
        Logger.log("sendgrid body:", response.headers);
        Logger.log("sendgrid body:", response.body);
        isEmailSent = true;
    });

    return isEmailSent;

}