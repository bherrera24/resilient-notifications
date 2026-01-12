import { INotificationProvider } from "../../Domain/Interfaces/INotificationProvider";
import { Notification } from "../../Domain/Entities/Notification";

export class SendGridMockProvider implements INotificationProvider {
  async send(notification: Notification): Promise<void> {
    const failureRate = Number(process.env.SENDGRID_FAILURE_RATE ?? 0.5);
    if (Math.random() < failureRate) {
      throw new Error("SendGrid failed");
    }
    console.log("SendGrid sent:", notification.message);
  }
}
