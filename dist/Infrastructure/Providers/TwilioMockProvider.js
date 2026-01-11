"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioMockProvider = void 0;
class TwilioMockProvider {
    async send(notification) {
        console.log('Twilio sent:', notification.message);
    }
}
exports.TwilioMockProvider = TwilioMockProvider;
