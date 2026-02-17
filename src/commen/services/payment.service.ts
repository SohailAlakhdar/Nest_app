import { BadRequestException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { Stripe } from "stripe";

@Injectable()
export class PaymentService {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    }
    async checkoutSession({
        customer_email,
        line_items,
        payment_method_types = ['card'],
        success_url = process.env.STRIPE_SUCCESS_URL!,
        cancel_url = process.env.STRIPE_CANCEL_URL!,
        discounts = [],
        mode = 'payment',
        metadata = {},
        currency = 'egp',
    }: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Response<Stripe.Checkout.Session>> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types,
            line_items,
            success_url,
            cancel_url,
            discounts,
            mode,
            metadata,
            currency,
            customer_email,

        });
        return session;

    }
    async createCoupon(data: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
        return await this.stripe.coupons.create(data);
    }
    async Webhook(req: Request) {
        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                req.body,
                req.headers['stripe-signature']!,
                process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err) {
            throw new Error(`Webhook Error: ${err.message}`);
        }
        if (event.type !== 'checkout.session.completed') {
            throw new BadRequestException('Invalid webhook event');
        }
        /**event: {
    id: 'evt_1T1ufGDKlBFFjSN5m7xqvc2Q',
    object: 'event',
    api_version: '2026-01-28.clover',
    created: 1771359274,
    data: { object: [Object] },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: 'checkout.session.completed'
  } */
        return event;
    }
}