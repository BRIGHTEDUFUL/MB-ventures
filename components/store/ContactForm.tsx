"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (2 to 100 characters).")
    .max(100, "Please enter your name (2 to 100 characters)."),
  email: z
    .string()
    .trim()
    .min(4, "Please enter your email address (4 to 200 characters).")
    .max(200, "Please enter your email address (4 to 200 characters).")
    .email("Please enter a valid email address."),
  phone: z.string().trim().max(30, "Please enter a phone number of up to 30 characters."),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN, `Your message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`)
    .max(MESSAGE_MAX, `Your message must be between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`),
});

type ContactValues = z.infer<typeof contactSchema>;

const TEXT_FIELDS = [
  {
    name: "name",
    label: "Name",
    type: "text",
    autoComplete: "name",
    placeholder: "e.g. Kwame Mensah",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "e.g. kwame@example.com",
  },
  {
    name: "phone",
    label: "Phone (optional)",
    type: "tel",
    autoComplete: "tel",
    placeholder: "e.g. 024 123 4567",
  },
] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function ContactForm() {
  const createMessage = useMutation(api.contactMessages.create);
  const [honeypot, setHoneypot] = useState("");
  const [sent, setSent] = useState(false);
  const confirmationRef = useRef<HTMLDivElement>(null);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });
  const { isSubmitting } = form.formState;
  const messageLength = (form.watch("message") || "").length;

  useEffect(() => {
    if (sent) confirmationRef.current?.focus();
  }, [sent]);

  const onSubmit = async (values: ContactValues) => {
    try {
      await createMessage({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message,
        website: honeypot || undefined,
      });
      setSent(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Your message could not be sent. Please try again."
      );
    }
  };

  if (sent) {
    return (
      <div
        ref={confirmationRef}
        tabIndex={-1}
        role="status"
        className="rounded-md border border-success/40 bg-success-soft p-5 focus-visible:outline-none"
      >
        <div className="flex items-start gap-2.5">
          <CheckCircle2
            className="w-5 h-5 text-success shrink-0 mt-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-sm text-ink leading-relaxed">
            Thanks, we received your message and will get back to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5 relative">
        {/* Honeypot: off-screen, not reachable by keyboard. Bots that fill it are dropped silently. */}
        <div className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            autoComplete="off"
          />
        </div>

        {TEXT_FIELDS.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-ink">
                  {field.label}
                  {field.name !== "phone" && <span className="text-danger"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    required={field.name !== "phone"}
                    {...formField}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-ink">
                Message <span className="text-danger">*</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={6} required placeholder="Tell us how we can help." {...field} />
              </FormControl>
              <p
                className={`text-[11px] font-mono text-right ${
                  messageLength > MESSAGE_MAX ? "text-danger" : "text-ink-muted"
                }`}
              >
                {messageLength} / {MESSAGE_MAX} characters
                {messageLength > MESSAGE_MAX && " (over the limit)"}
              </p>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-11 rounded-md bg-brand text-white text-sm font-semibold hover:bg-brand-hover active:bg-brand-active transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_RING}`}
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </form>
    </Form>
  );
}
