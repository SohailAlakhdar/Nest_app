import { BadRequestException, Body, Injectable } from "@nestjs/common";
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
    async webhook(req: Request, signature: string): Promise<Stripe.Event> {
        let event: Stripe.Event;
        console.log('SECRET:', process.env.STRIPE_WEBHOOK_SECRET);
        console.log({ signature });
        console.log({ headers: req.headers });
        console.log({ Body: req.body });

        event = this.stripe.webhooks.constructEvent(
            req.body,
            // req.headers['stripe-signature']!,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log(event);
        console.log({ type: event.type });

        if (event.type != 'checkout.session.completed') {
            throw new BadRequestException('Invalid webhook event');
        }

        return event;
    }

    async createPaymentIntent(data: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent> {
        const paymentIntent = await this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }
    async createPaymentMethod(data: Stripe.PaymentMethodCreateParams): Promise<Stripe.PaymentMethod> {
        const paymentMethod = await this.stripe.paymentMethods.create(data);
        return paymentMethod;
    }
    async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
        return paymentIntent;
    }
    async confirmPaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(id);
        if (paymentIntent.status !== 'requires_payment_method') {
            throw new BadRequestException('Payment intent cannot be confirmed');
        }
        const paymentConfirm = await this.stripe.paymentIntents.confirm(id);
        console.log({ paymentConfirm });
        return paymentConfirm;
    }
    async refundPaymentIntent(id: string, amount?: number): Promise<Stripe.Refund> {
        const refund = await this.stripe.refunds.create({
            payment_intent: id,
            amount,
        });
        console.log({ refund });
        return refund;
    }
}