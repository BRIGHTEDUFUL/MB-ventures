export type PageDraft = {
  slug: string;
  title: string;
  body: string;
  showInFooter: boolean;
  sortOrder: number;
};

/**
 * Draft content for the standard shop pages, seeded unpublished by
 * convex/pagesSeed.ts. Every [bracketed] placeholder must be replaced by the
 * owner in the admin editor before the page is published. Copy follows
 * docs/DESIGN.md (no banned words, no em dashes, no exclamation marks).
 */
export const pageDrafts: PageDraft[] = [
  {
    slug: "about",
    title: "About us",
    showInFooter: true,
    sortOrder: 10,
    body: `# About us

[Shop name] is a computer accessories, hardware and office furniture shop in [city, Ghana]. We supply the parts, peripherals and furniture that people and businesses need to set up a workspace: keyboards, mice, monitors, docking stations, storage, cables, ergonomic office chairs, standing desks and worktables.

## What we sell

- Computer accessories: keyboards, mice, webcams, headsets, docking stations and cables
- Hardware and storage: SSDs, RAM, external drives, power and cooling accessories
- Office furniture: ergonomic chairs, height-adjustable standing desks and worktables

Every product page shows the price in GH₵, the current stock count and full specifications, taken straight from our inventory.

## Delivery or pickup

- **Home delivery:** we deliver to [areas served] within [delivery timeframe] for GH₵ [delivery fee]. Other zones, fees and timeframes are listed on the [Delivery and returns](/delivery-and-returns) page and shown at checkout before you confirm an order.
- **In-store pickup:** order online, wait for our ready-for-pickup message, then collect from [store address] during [opening hours]. Bring your order number and a valid ID.

## How we work

- Prices are in Ghana cedis (GH₵) and [include / do not include] applicable taxes, as noted on each product page.
- Payment is straightforward: send the order total by Mobile Money (MTN MoMo, Vodafone Cash or AirtelTigo Money) and submit the transaction reference, pay cash when the goods arrive, or pay at the pickup counter in store.
- Stock shown on a product page is what we physically hold. Units on unpaid orders are reserved for the customer who ordered them, so what you see is what is genuinely available.
- Orders are confirmed by [phone / email / WhatsApp] and you get an order number you can quote at any time.

## Our commitment

- Plain, accurate product information. If a specification or stock count on this site is wrong, tell us and we will correct it.
- Clear pricing with no hidden charges: the delivery fee appears at checkout before you commit to an order.
- Support after the sale: a [duration] store warranty on [eligible items], help with manufacturer warranty claims and a written returns process.
- A quick reply: reach us on [phone number], [WhatsApp number] or [email address], or send a message through the [contact form](/contact).

## Visit the shop

[Street address]
[City, region]
[Opening hours]
[Phone number]`,
  },
  {
    slug: "delivery-and-returns",
    title: "Delivery and returns",
    showInFooter: true,
    sortOrder: 20,
    body: `# Delivery and returns

## Home delivery

We deliver to the zones below. The fee for your address is calculated at checkout before you confirm the order.

- [Zone name]: [areas covered], GH₵ [fee], [timeframe]
- [Zone name]: [areas covered], GH₵ [fee], [timeframe]
- [Zone name]: [areas covered], GH₵ [fee], [timeframe]

Delivery is free on orders over GH₵ [amount]. Delete this line if free delivery is not offered.

Delivery fees are set by the shop and shown at checkout. We confirm a delivery window by phone or WhatsApp on [phone number] before dispatch.

### On delivery day

- Keep your phone close so the rider can reach you.
- Check the parcel while the rider is present. If the packaging is damaged, note it before you accept the parcel and contact us the same day.
- For cash on delivery, have the exact amount in GH₵ ready.
- Have your order number handy, for example ORD-000123.

## In-store pickup

1. Place your order online and choose pickup at checkout.
2. Wait for our ready-for-pickup message on [phone number] or [email address]. We hold ready orders for [number] days, then contact you to arrange a new time.
3. Bring your order number and a valid ID (Ghana card, voter's ID or driver's licence).
4. Collect from [store address] during [opening hours]. Pay at the counter if you chose pay in store; otherwise pay by MoMo before collection.

## Returns

You can return most unused items within [number] days of delivery or pickup.

Conditions for a return:

- The item is unused and in its original packaging, with accessories, manuals and cables included.
- The item shows no signs of installation or use.
- You have the order number or another proof of purchase.
- [List any excluded categories here, for example opened software or special orders.]

### How to request a return

1. Send a message through the [contact form](/contact) or call [phone number] with your order number.
2. We confirm whether the item is eligible and send you the return instructions.
3. Drop the item at [return address] during [return hours], or we arrange collection where that is offered, at GH₵ [fee if any].

### Refunds

- **Mobile Money orders:** we refund to the MoMo number the payment was sent from, within [number] business days of receiving and checking the item.
- **Cash on delivery orders:** [refund to a MoMo number of your choice / refund in cash], within [number] business days.
- **In-store purchases:** [cash refund to the original payer / MoMo refund], within [number] business days.
- The original delivery fee is refunded [when the shop cancels the order / when the error was ours / is not refunded]. Choose one and delete the rest.

## Damaged, missing or wrong items

Contact us within [number] days of delivery with your order number and a photo of the item and packaging. We [replace the item or refund the order] at no cost to you.

## Warranty claims

Faults that appear after the return window are handled under our [Warranty](/warranty) policy.`,
  },
  {
    slug: "warranty",
    title: "Warranty",
    showInFooter: true,
    sortOrder: 30,
    body: `# Warranty

Two kinds of cover apply to what we sell: our own store warranty and the manufacturer's warranty.

## Store warranty

[Shop name] gives a [duration] store warranty on [eligible items] from the date of purchase. During that period, if the item fails under normal use, we [repair it, replace it, or refund it]. The store warranty [starts on the purchase date / starts when the manufacturer warranty ends]. Choose one and delete the rest.

## Manufacturer warranty

Many items also carry a manufacturer warranty of [duration]. The manufacturer's own terms apply to those claims. We help you start the claim and provide your invoice. For [some categories] you may need to deal with the manufacturer directly.

Your proof of purchase is your order number together with the invoice we send with your order.

### What is covered

- Manufacturing defects and component failure during normal use
- Faults present on arrival, reported within [number] days of delivery or pickup
- Battery faults [where applicable], under the manufacturer's terms

### What is not covered

- Physical damage: drops, knocks, crushing, liquid contact, burns or pest damage
- Misuse, or operation outside the specifications, including the wrong voltage or charger
- Opening, modification or repair by anyone other than us or the manufacturer
- Normal wear on consumable parts, such as batteries, filters, pads and cables
- Missing or altered serial numbers and labels
- Data loss, software setup or configuration

## How to claim

1. Send a message through the [contact form](/contact) or call [phone number] with your order number.
2. Describe the fault, and attach photos or a short video if you can.
3. We assess the item within [number] business days and tell you the outcome.
4. For an approved claim, bring or send the item to [return address] during [return hours], quoting your order number.

Delivery costs for a warranty claim are paid by [the shop / the customer, depending on who is at fault]. Choose one and delete the rest.

We complete an approved claim by [repair, replacement or refund] within [number] days of receiving the item.

## Exclusions and limits

- The warranty covers the item itself. It does not cover [consequential losses such as data recovery or lost working time].
- A repair or replacement under warranty does not extend the original warranty period.
- The warranty is void if the item shows physical damage, misuse or unauthorised repair.

## Where to bring a warranty item

[Return address]
[Opening hours]
[Phone number]

Bring your order number and a valid ID.`,
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    showInFooter: true,
    sortOrder: 40,
    body: `# Frequently asked questions

## Ordering

### How do I place an order?

Add items to your cart, open the cart and choose Checkout. Enter your contact details, choose delivery or pickup, pick a payment method and confirm the order. You receive an order number, for example ORD-000123. You can order without an account, but an account keeps your addresses and order history in one place.

### How do I check my order?

Sign in and open your orders, or contact us on [phone number] with your order number. An order moves through these states: awaiting payment, confirmed, out for delivery, ready for pickup, completed, cancelled.

## Payment

### How does Mobile Money payment work?

1. Send the order total to our MoMo number [shop MoMo number] from your own wallet, using MTN MoMo, Vodafone Cash or AirtelTigo Money.
2. Open your order and enter the transaction reference from your MoMo confirmation message.
3. Our team checks the payment against our MoMo account and marks the order as paid. We start processing once the payment is verified.

We never ask for your card details, and there is no card payment on this site.

### Which MoMo networks do you accept?

MTN MoMo, Vodafone Cash and AirtelTigo Money, on the numbers shown at checkout: [MTN number], [Vodafone Cash number], [AirtelTigo number].

### Can I pay cash on delivery?

Yes, in [areas served]. Pay the rider the exact total in GH₵ when the goods arrive.

### Can I pay in store?

Yes. Choose pay in store at checkout, then pay at the pickup counter when you collect your order.

## Delivery

### How long does delivery take?

It depends on your zone: [Zone 1]: [timeframe], [Zone 2]: [timeframe], [Zone 3]: [timeframe]. The timeframe for your address is shown at checkout, and we confirm a delivery window by phone or WhatsApp on [phone number].

### How much does delivery cost?

GH₵ [fee] per zone, listed at checkout before you confirm the order. Delivery is free on orders over GH₵ [amount] [delete this sentence if not offered].

## Pickup

### Can I collect my order instead of having it delivered?

Yes. Choose pickup at checkout, wait for our ready-for-pickup message, then collect from [store address] during [opening hours].

### What should I bring for pickup?

Your order number and a valid ID (Ghana card, voter's ID or driver's licence).

## Returns

### How do I return an item?

Contact us through the [contact form](/contact) within [number] days of delivery or pickup with your order number. The item must be unused, in its original packaging and complete with its accessories. We send you the return instructions.

### How do refunds work?

For Mobile Money orders we refund to the number the payment was sent from, within [number] business days of checking the returned item. For in-store purchases we refund [in cash / by MoMo] within [number] business days. See [Delivery and returns](/delivery-and-returns) for the full process.

## Warranty

### What does the warranty cover?

A [duration] store warranty on [eligible items] covers faults under normal use, and many items also carry a manufacturer warranty of [duration]. Physical damage, misuse and unauthorised repair are not covered. See [Warranty](/warranty).

## Stock

### A product shows out of stock. Will it come back?

Stock counts come from our live inventory. Ask through the [contact form](/contact) and we will tell you when it is expected back: [restock timeframe].

### What does "available" mean on a product page?

Available is the stock on hand minus the units held by unpaid orders. When an order is placed we reserve those units for [number] minutes while payment is completed. If payment is not received, the order expires and the items go back into stock.`,
  },
  {
    slug: "terms",
    title: "Terms and conditions",
    showInFooter: true,
    sortOrder: 50,
    body: `# Terms and conditions

These terms apply when you order from [shop name] at [website address]. [Shop name] is operated by [legal entity name], [registered address]. [Contact details: phone number and email address].

## Ordering

- You place an order through this website by adding items to your cart and completing checkout. You can order with or without an account.
- An order is accepted when we confirm it by [confirmation email / phone call / WhatsApp message]. Until then, items in your cart are not reserved.
- We may decline or cancel an order if an item is out of stock, a price is clearly incorrect, or payment is not received. If you have already paid, we refund you in full using the process described under Returns and refunds.
- Keep your order number. It is how we find your order for questions, delivery, returns and warranty claims.

## Pricing

- All prices are in Ghana cedis (GH₵) and [include / do not include] applicable taxes, as noted on the product page and at checkout.
- The delivery fee for your address is shown at checkout before you confirm the order.
- The price charged is the price shown on your order confirmation.
- If a price on this site is clearly wrong, we will contact you before processing the order and give you the choice to pay the correct price or cancel.

## Payment methods

- **Mobile Money:** send the order total to [shop MoMo number] using MTN MoMo, Vodafone Cash or AirtelTigo Money, then submit the transaction reference on your order. We verify the reference against our MoMo account before we start processing. If payment is not received within [number] minutes, the order expires and the reserved stock is released.
- **Cash on delivery:** pay the rider the exact amount in GH₵ when the goods arrive, in [areas served].
- **Pay in store:** pay at the pickup counter when you collect.

We do not accept card payments on this site. We never ask for your card details.

## Delivery

- Zones, fees and timeframes are shown at checkout and on the [Delivery and returns](/delivery-and-returns) page.
- Please check the parcel on arrival. Report damage, missing items or the wrong item within [number] days with your order number.
- Risk in the goods passes to you when they are delivered to you or collected by you.
- We are not responsible for delays caused by [circumstances outside our control, for example extreme weather or road closures].

## Pickup

- Choose pickup at checkout and wait for the ready-for-pickup message before travelling to the shop.
- Bring your order number and a valid ID. We hold ready orders for [number] days.

## Returns and refunds

- Most unused items in their original packaging can be returned within [number] days of delivery or pickup.
- Mobile Money orders are refunded to the MoMo number the payment was sent from. In-store purchases are refunded [in cash / by MoMo]. Cash on delivery orders are refunded [by MoMo / in cash]. Refunds are issued within [number] business days of the returned item being received and checked.
- Full conditions and the steps to follow are on the [Delivery and returns](/delivery-and-returns) page.

## Warranty

- We give a [duration] store warranty on [eligible items], and many items also carry a manufacturer warranty. Physical damage, misuse and unauthorised repair are not covered.
- The full warranty terms, including how to claim, are on the [Warranty](/warranty) page.

## Liability

- We are responsible for loss or damage that is foreseeable, that is, a direct result of our breaking these terms.
- We are not responsible for losses that were not foreseeable when the contract was made, and we do not cover [losses such as lost profits or data recovery costs].
- Our total liability for any order is limited to the amount you paid for that order, to the extent the law allows.
- Nothing in these terms limits liability for [death or personal injury caused by negligence, or for fraud], which the law does not permit us to exclude.
- Nothing in these terms affects your statutory rights as a consumer.

## Governing law

These terms are governed by the laws of [Ghana / jurisdiction], and the courts of [city] have jurisdiction over any dispute. [Delete whichever option does not apply.]

## Changes to these terms

We may update these terms from time to time. The version in force when you place your order applies to that order. The current version and its date are published on this page. [Last updated: [date]].`,
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    showInFooter: true,
    sortOrder: 60,
    body: `# Privacy policy

This policy explains what personal information [shop name] collects when you use [website address], why we use it, who processes it, and how to ask for a copy, a correction or a deletion.

## What we collect

**Account details:** your name, email address, phone number and the delivery addresses you save.

**Orders and delivery:** the items you order, your order number, delivery or pickup details, and messages you send us through the contact form.

**Payment details:** Mobile Money is paid manually. You send the money from your own wallet to our MoMo number and submit the transaction reference on your order, so that we can match your payment. We store only that reference. We never see or store card details, and there is no card payment on this site. For cash on delivery we record that the cash was collected, and for pay in store we record payment at the counter.

## How we use your information

- To process, deliver and track your orders, arrange pickup, and handle returns and warranty claims
- To verify manual Mobile Money payments against our MoMo account
- To reply to messages sent through the contact form
- To keep order and accounting records [required by law]
- To send transactional emails, such as order updates, when email is switched on

## Who processes your information

- **Convex** hosts our database and server functions.
- **Vercel** hosts this website.
- **Resend** sends transactional email, for example order updates, when email is switched on.
- [Delivery partner name] delivers orders in [areas covered]. We share only the delivery address and phone number needed to complete the delivery.

We do not sell your personal information. We share it only with the services above and where the law requires it.

## Cookies

We use cookies for two things: keeping you signed in and remembering your cart. [We do not use advertising or tracking cookies.] You can clear cookies in your browser at any time. Signing out clears the sign-in cookie.

## How long we keep it

We keep account details while your account is open. Order records are kept for [number] years for tax and accounting purposes. Contact form messages are kept for [number] months.

## Your rights

You can ask us for a copy of the information we hold about you, or ask us to correct or delete it. Send a request through the [contact form](/contact), or call [phone number] or email [email address]. We may need to confirm your identity before acting on a request. We keep records the law requires us to hold, even after a deletion request.

## Changes to this policy

We update this policy when our practices change. [Last updated: [date]].

## Contact

[Shop name]
[Street address]
[Phone number]
[Email address]`,
  },
];
