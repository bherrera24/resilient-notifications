"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridMockProvider = void 0;
class SendGridMockProvider {
    async send(notification) {
        if (Math.random() < 0.5) {
            throw new Error('SendGrid failed');
        }
        console.log('SendGrid sent:', notification.message);
    }
}
exports.SendGridMockProvider = SendGridMockProvider;
