"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryNotificationQueue = void 0;
const NotificationType_1 = require("../../Domain/Entities/NotificationType");
class InMemoryNotificationQueue {
    constructor() {
        this.transactionalQueue = [];
        this.marketingQueue = [];
    }
    enqueue(notification) {
        if (notification.type === NotificationType_1.NotificationType.TRANSACTIONAL) {
            this.transactionalQueue.push(notification);
        }
        else {
            this.marketingQueue.push(notification);
        }
    }
    dequeue() {
        if (this.transactionalQueue.length > 0) {
            return this.transactionalQueue.shift();
        }
        return this.marketingQueue.shift();
    }
    isEmpty() {
        return (this.transactionalQueue.length === 0 && this.marketingQueue.length === 0);
    }
}
exports.InMemoryNotificationQueue = InMemoryNotificationQueue;
