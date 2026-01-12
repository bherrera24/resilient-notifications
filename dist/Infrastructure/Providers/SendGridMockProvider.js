"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridMockProvider = void 0;
class SendGridMockProvider {
    async send(notification) {
        const failureRate = Number(process.env.SENDGRID_FAILURE_RATE ?? 0.5);
        if (Math.random() < failureRate) {
            throw new Error("SendGrid failed");
        }
        console.log("SendGrid sent:", notification.message);
    }
}
exports.SendGridMockProvider = SendGridMockProvider;
