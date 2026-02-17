export enum OrderStatusNameEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
}
export enum OrderStatusEnum {
    PENDING = 0, // 🕒 Order is created but not completed yet.
    CONFIRMED = 1, // ✅ Order is valid and accepted.
    SHIPPED = 2, // 🚚 Order is on the way to the customer.
    DELIVERED = 3, // 📦 Order has been delivered to the customer.
    CANCELLED = 4, // ❌ Order has been cancelled by the customer or the system.
    FAILED = 5, // ⚠️ Order processing failed due to payment or other issues.
}

export enum PaymentMethodEnum {
    CASH = "CASH",
    CARD = "CARD",
    WALLET = "WALLET",
}