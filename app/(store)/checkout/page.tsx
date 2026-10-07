"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/lib/cart/CartContext";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Container } from "@/components/shared/Container";
import { Price } from "@/components/shared/Price";
import { normalizePhone } from "@/lib/phone";
import { toast } from "sonner";
import {
  Truck,
  Store,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Check,
  Copy,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type FulfillmentType = "delivery" | "pickup";
type PaymentMethod = "momo" | "cash_on_delivery" | "pay_in_store";
type MomoNetwork = "MTN" | "Telecel" | "AirtelTigo";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();
  const { user } = useCurrentUser();

  const deliveryZones = useQuery(api.fulfillment.listDeliveryZones);
  const pickupLocations = useQuery(api.fulfillment.listPickupLocations);
  const settings = useQuery(api.siteSettings.getPublicSettings);
  const createOrder = useMutation(api.orders.create);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [selectedPickupId, setSelectedPickupId] = useState<string>("");

  // Address
  const [streetAddress, setStreetAddress] = useState("");
  const [cityArea, setCityArea] = useState("Accra");
  const region = "Greater Accra";
  const [addressNotes, setAddressNotes] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>("MTN");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoReference, setMomoReference] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMomoIndex, setCopiedMomoIndex] = useState<number | null>(null);
  const [checkoutKey] = useState(
    () => `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (user) {
      if (user.name && !name) setName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) {
        setPhone(user.phone);
        setMomoPhone(user.phone);
      }
    }
  }, [user, name, email, phone]);

  // Set default delivery zone when zones load
  useEffect(() => {
    if (deliveryZones && deliveryZones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(deliveryZones[0]._id);
    }
  }, [deliveryZones, selectedZoneId]);

  // Set default pickup location when locations load
  useEffect(() => {
    if (pickupLocations && pickupLocations.length > 0 && !selectedPickupId) {
      setSelectedPickupId(pickupLocations[0]._id);
    }
  }, [pickupLocations, selectedPickupId]);

  // Update allowed payment methods when fulfillment changes
  useEffect(() => {
    if (fulfillment === "pickup" && paymentMethod === "cash_on_delivery") {
      setPaymentMethod("pay_in_store");
    } else if (fulfillment === "delivery" && paymentMethod === "pay_in_store") {
      setPaymentMethod("cash_on_delivery");
    }
  }, [fulfillment, paymentMethod]);

  // Compute delivery fee
  const selectedZone = deliveryZones?.find((z) => z._id === selectedZoneId);
  let deliveryFee = 0;
  if (fulfillment === "delivery" && selectedZone) {
    const isFree = settings?.freeDeliveryThreshold && subtotal >= settings.freeDeliveryThreshold;
    deliveryFee = isFree ? 0 : selectedZone.fee;
  }

  const grandTotal = subtotal + deliveryFee;

  const handleCopyMomoNumber = async (number: string, index: number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedMomoIndex(index);
      setTimeout(() => setCopiedMomoIndex(null), 2000);
    } catch {
      toast.error("Could not copy the MoMo number. Copy it manually.");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checkout.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address for order notifications.");
      return;
    }

    const normalizedPhone = normalizePhone(phone, "+233");
    if (!normalizedPhone) {
      toast.error("Please enter a valid Ghana phone number (e.g. 024 123 4567).");
      return;
    }

    if (fulfillment === "delivery") {
      if (!selectedZoneId) {
        toast.error("Please select a delivery zone.");
        return;
      }
      if (!streetAddress.trim()) {
        toast.error("Please enter your street / residential delivery address.");
        return;
      }
    } else if (fulfillment === "pickup") {
      if (!selectedPickupId) {
        toast.error("Please select a pickup branch.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: normalizedPhone,
        },
        fulfillment,
        deliveryAddress:
          fulfillment === "delivery"
            ? {
                line1: streetAddress.trim(),
                city: cityArea.trim() || "Accra",
                region: region.trim() || "Greater Accra",
                notes: addressNotes.trim() || undefined,
              }
            : undefined,
        deliveryZoneId:
          fulfillment === "delivery" ? (selectedZoneId as Id<"deliveryZones">) : undefined,
        pickupLocationId:
          fulfillment === "pickup" ? (selectedPickupId as Id<"pickupLocations">) : undefined,
        paymentMethod,
        momoNetwork: paymentMethod === "momo" ? momoNetwork : undefined,
        momoPhone:
          paymentMethod === "momo"
            ? normalizePhone(momoPhone || phone, "+233") || momoPhone.trim()
            : undefined,
        momoReference: paymentMethod === "momo" ? momoReference.trim() : undefined,
        items: items.map((i) => ({
          productId: i.productId as Id<"products">,
          quantity: i.quantity,
        })),
        checkoutKey,
        customerNote: customerNote.trim() || undefined,
      };

      const result = await createOrder(orderPayload);

      clearCart();
      toast.success(`Order ${result.orderNumber} placed successfully!`);
      router.push(`/order/${result.orderNumber}`);
    } catch (err: unknown) {
      console.error("Order submission failed:", err);
      const message =
        err instanceof Error ? err.message : "Failed to place order. Please check your details.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-12 bg-canvas min-h-[calc(100dvh-180px)]">
        <Container>
          <div className="max-w-md mx-auto bg-surface border border-line rounded-lg p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-ink-muted mx-auto mb-3 stroke-[1.25]" />
            <h1 className="font-heading font-bold text-xl text-ink mb-2">Your cart is empty</h1>
            <p className="text-sm text-ink-muted mb-6">
              You must have items in your cart before you can proceed to checkout.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-md font-semibold text-sm bg-brand text-surface hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 ease-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              Browse catalog
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-canvas min-h-screen">
      <Container>
        {/* Checkout Header */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-8">
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="min-h-11 min-w-11 -ml-3 flex items-center justify-center rounded-md text-ink-muted hover:text-ink transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Return to cart"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink tracking-tight">
              Checkout
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted bg-surface border border-line px-3 py-1.5 rounded-sm">
            <Lock className="w-4 h-4 text-ink-muted" strokeWidth={1.5} aria-hidden="true" />
            <span>Secure order</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Contact Information */}
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                  <span className="w-6 h-6 rounded-full bg-brand text-surface text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h2 className="font-heading font-bold text-base text-ink">Contact information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-ink mb-1.5">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Email Address (for order tracking) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kwame@example.com"
                        className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Phone Number (Ghana) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="024 123 4567"
                        className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Fulfillment Method */}
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                  <span className="w-6 h-6 rounded-full bg-brand text-surface text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="font-heading font-bold text-base text-ink">Delivery or pickup</h2>
                </div>

                {/* Fulfillment Selector Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                      fulfillment === "delivery"
                        ? "border-brand bg-brand-soft shadow-layer-sm"
                        : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <Truck
                      className={`w-5 h-5 shrink-0 mt-0.5 ${fulfillment === "delivery" ? "text-ink" : "text-ink-muted"}`}
                    />
                    <div>
                      <span className="font-heading font-semibold text-sm text-ink block">
                        Doorstep Delivery
                      </span>
                      <span className="text-xs text-ink-muted block mt-0.5">
                        Dispatch rider to your location in Accra
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`p-4 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                      fulfillment === "pickup"
                        ? "border-brand bg-brand-soft shadow-layer-sm"
                        : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <Store
                      className={`w-5 h-5 shrink-0 mt-0.5 ${fulfillment === "pickup" ? "text-ink" : "text-ink-muted"}`}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-semibold text-sm text-ink">
                          In-Store Pickup
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-success/15 text-success px-1.5 py-0.5 rounded">
                          FREE
                        </span>
                      </div>
                      <span className="text-xs text-ink-muted block mt-0.5">
                        Collect at Circle store, Accra
                      </span>
                    </div>
                  </button>
                </div>

                {/* Delivery Form Details */}
                {fulfillment === "delivery" ? (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Select Delivery Zone <span className="text-danger">*</span>
                      </label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        {deliveryZones?.map((z) => (
                          <option key={z._id} value={z._id}>
                            {z.name} · GHS {(z.fee / 100).toFixed(2)} ({z.estimatedDays})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Street Address / Building / House No. <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. House 24, Ring Road Central, near Danquah Circle"
                        className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink mb-1.5">
                          City / Area <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={cityArea}
                          onChange={(e) => setCityArea(e.target.value)}
                          placeholder="e.g. Osu, East Legon, Spintex, Tema"
                          className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-ink mb-1.5">Region</label>
                        <input
                          type="text"
                          readOnly
                          value={region}
                          className="w-full h-11 px-3.5 rounded-md border border-line bg-canvas text-sm text-ink-muted cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Landmark / Delivery Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressNotes}
                        onChange={(e) => setAddressNotes(e.target.value)}
                        placeholder="e.g. Opposite Shell filling station, call on arrival"
                        className="w-full h-11 px-3.5 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      />
                    </div>
                  </div>
                ) : (
                  /* Pickup Location Details */
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">
                        Select Pickup Store Location <span className="text-danger">*</span>
                      </label>
                      <select
                        value={selectedPickupId}
                        onChange={(e) => setSelectedPickupId(e.target.value)}
                        className="w-full h-11 px-3 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        {pickupLocations?.map((loc) => (
                          <option key={loc._id} value={loc._id}>
                            {loc.name} · {loc.address}
                          </option>
                        ))}
                      </select>
                    </div>

                    {pickupLocations && pickupLocations.length > 0 && (
                      <div className="p-3.5 bg-canvas rounded-md border border-line text-xs text-ink space-y-1">
                        <p className="font-semibold">
                          {pickupLocations.find((l) => l._id === selectedPickupId)?.name ||
                            "MB Ventures"}
                        </p>
                        <p className="text-ink-muted">
                          {pickupLocations.find((l) => l._id === selectedPickupId)?.address}
                        </p>
                        <p className="text-ink-muted font-mono">
                          Opening Hours:{" "}
                          {pickupLocations.find((l) => l._id === selectedPickupId)?.openingHours}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-line">
                  <span className="w-6 h-6 rounded-full bg-brand text-surface text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h2 className="font-heading font-bold text-base text-ink">Payment method</h2>
                </div>

                <div className="space-y-3">
                  {/* Option A: Mobile Money (MoMo) */}
                  <label
                    className={`p-4 rounded-lg border flex flex-col gap-3 cursor-pointer transition-colors ${
                      paymentMethod === "momo"
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="momo"
                          checked={paymentMethod === "momo"}
                          onChange={() => setPaymentMethod("momo")}
                          className="w-4 h-4 text-ink focus:ring-focus"
                        />
                        <div>
                          <span className="font-heading font-semibold text-sm text-ink block">
                            Mobile Money (MTN MoMo, Telecel, AirtelTigo)
                          </span>
                          <span className="text-xs text-ink-muted block mt-0.5">
                            Transfer directly to shop MoMo account and submit reference
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold bg-accent-soft text-accent px-2 py-0.5 rounded">
                        Fast Verification
                      </span>
                    </div>

                    {paymentMethod === "momo" && (
                      <div className="mt-2 pt-3 border-t border-line space-y-4 text-xs">
                        {/* Shop MoMo numbers banner */}
                        <div className="bg-surface p-3 rounded border border-line space-y-2">
                          <p className="font-semibold text-ink">
                            Official MB Ventures GH MoMo Accounts:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                            {settings?.momoAccounts && settings.momoAccounts.length > 0 ? (
                              settings.momoAccounts.map((acc, i) => (
                                <div
                                  key={i}
                                  className="p-2 bg-canvas rounded border border-line flex items-start justify-between gap-2"
                                >
                                  <span className="min-w-0">
                                    <span className="font-bold text-ink block">
                                      {acc.network} MoMo:
                                    </span>
                                    <span className="text-sm font-bold text-ink block">
                                      {acc.number}
                                    </span>
                                    <span className="text-[11px] text-ink-muted block">
                                      {acc.name}
                                    </span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyMomoNumber(String(acc.number), i)}
                                    aria-label={`Copy ${acc.network} MoMo number`}
                                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border border-line-strong bg-surface text-ink hover:bg-canvas hover:border-ink-muted transition-colors duration-120 min-h-[44px]"
                                  >
                                    {copiedMomoIndex === i ? (
                                      <>
                                        <Check className="w-3 h-3 text-success" aria-hidden />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" aria-hidden />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))
                            ) : (
                              <div className="p-2 bg-canvas rounded border border-line col-span-2 flex items-start justify-between gap-2">
                                <span>
                                  <span className="font-bold text-ink block">
                                    MTN Mobile Money:
                                  </span>
                                  <span className="text-sm font-bold text-ink block">
                                    024 123 4567
                                  </span>
                                  <span className="text-[11px] text-ink-muted block">
                                    MB VENTURES GH
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyMomoNumber("0241234567", 0)}
                                  aria-label="Copy MoMo number"
                                  className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border border-line-strong bg-surface text-ink hover:bg-canvas hover:border-ink-muted transition-colors duration-120 min-h-[44px]"
                                >
                                  {copiedMomoIndex === 0 ? (
                                    <>
                                      <Check className="w-3 h-3 text-success" aria-hidden />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" aria-hidden />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Customer Sender Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-ink mb-1">
                              Your MoMo Network
                            </label>
                            <select
                              value={momoNetwork}
                              onChange={(e) => setMomoNetwork(e.target.value as MomoNetwork)}
                              className="w-full h-11 px-2.5 rounded border border-line-strong bg-surface text-xs text-ink"
                            >
                              <option value="MTN">MTN MoMo</option>
                              <option value="Telecel">Telecel Cash</option>
                              <option value="AirtelTigo">AirtelTigo Money</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-ink mb-1">
                              Sender MoMo Phone Number
                            </label>
                            <input
                              type="tel"
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              placeholder={phone || "024xxxxxxx"}
                              className="w-full h-11 px-3 rounded border border-line-strong bg-surface text-xs text-ink font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-ink mb-1">
                            MoMo Transaction Reference / ID (Optional now, can submit after)
                          </label>
                          <input
                            type="text"
                            value={momoReference}
                            onChange={(e) => setMomoReference(e.target.value)}
                            placeholder="e.g. 1928374652"
                            className="w-full h-11 px-3 rounded border border-line-strong bg-surface text-xs text-ink font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Option B: Cash on Delivery (Delivery fulfillment only) */}
                  {fulfillment === "delivery" && (
                    <label
                      className={`p-4 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                        paymentMethod === "cash_on_delivery"
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-surface hover:border-line-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === "cash_on_delivery"}
                        onChange={() => setPaymentMethod("cash_on_delivery")}
                        className="w-4 h-4 mt-0.5 text-ink focus:ring-focus"
                      />
                      <div>
                        <span className="font-heading font-semibold text-sm text-ink block">
                          Cash on Delivery (Accra)
                        </span>
                        <span className="text-xs text-ink-muted block mt-0.5">
                          Pay cash or MoMo directly to the dispatch rider upon receiving your items.
                        </span>
                      </div>
                    </label>
                  )}

                  {/* Option C: Pay in Store (Pickup fulfillment only) */}
                  {fulfillment === "pickup" && (
                    <label
                      className={`p-4 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                        paymentMethod === "pay_in_store"
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-surface hover:border-line-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_in_store"
                        checked={paymentMethod === "pay_in_store"}
                        onChange={() => setPaymentMethod("pay_in_store")}
                        className="w-4 h-4 mt-0.5 text-ink focus:ring-focus"
                      />
                      <div>
                        <span className="font-heading font-semibold text-sm text-ink block">
                          Pay at Pickup Counter
                        </span>
                        <span className="text-xs text-ink-muted block mt-0.5">
                          Pay cash or MoMo at our Circle store counter when you collect your goods.
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Step 4: Special Instructions (Optional) */}
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-3">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Order Notes & Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Special instructions for delivery rider or shop attendants..."
                  className="w-full p-3 rounded-md border border-line-strong bg-surface text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                />
              </div>
            </div>

            {/* Right Column: Order Review Sidebar (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 space-y-4 sticky top-20">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h2 className="font-heading font-bold text-base text-ink">
                    Order Items ({itemCount})
                  </h2>
                  <Link
                    href="/cart"
                    className="min-h-[44px] inline-flex items-center text-xs text-ink-muted hover:text-ink underline"
                  >
                    Edit Cart
                  </Link>
                </div>

                {/* Items List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-line pr-1 space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="pt-2 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-canvas border border-line rounded overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {item.primaryImageUrl ? (
                          <Image
                            src={item.primaryImageUrl}
                            alt={item.name}
                            width={48}
                            height={48}
                            unoptimized
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-ink-muted stroke-[1.25]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                          Qty: {item.quantity} × <Price amount={item.unitPrice} />
                        </p>
                      </div>

                      <div className="text-right">
                        <Price
                          amount={item.unitPrice * item.quantity}
                          className="font-semibold text-xs text-ink"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 pt-3 border-t border-line text-xs">
                  <div className="flex justify-between text-ink">
                    <span className="text-ink-muted">Subtotal</span>
                    <Price amount={subtotal} className="font-semibold" />
                  </div>

                  <div className="flex justify-between text-ink">
                    <span className="text-ink-muted">
                      {fulfillment === "delivery" ? "Delivery Fee" : "In-Store Pickup"}
                    </span>
                    {fulfillment === "pickup" || deliveryFee === 0 ? (
                      <span className="font-mono font-bold text-success">FREE</span>
                    ) : (
                      <Price amount={deliveryFee} className="font-semibold" />
                    )}
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-line text-ink">
                    <span className="font-heading font-bold text-base">Total Due</span>
                    <Price
                      amount={grandTotal}
                      className="font-heading font-bold text-xl text-ink"
                    />
                  </div>
                  <p className="text-[11px] text-ink-subtle">
                    {settings?.pricesIncludeTaxNote || "Prices include applicable taxes"}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full h-[52px] rounded-md font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Policy & Security Note */}
                <div className="text-[11px] text-ink-subtle text-center space-y-1 pt-1">
                  <p>By placing an order, you agree to our Terms of Sale and Warranty Policy.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
