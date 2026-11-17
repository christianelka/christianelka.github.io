"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-xl border border-[#DCE8DF] bg-white px-4 py-3 text-sm text-[#0F4125] placeholder:text-[#0F4125]/40 outline-none transition focus:border-[#367C52] focus:ring-2 focus:ring-[#367C52]/20";

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="scroll-mt-20 bg-white px-5 py-20 text-[#0F4125] sm:py-24 md:px-8 lg:px-12"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center">
          <SectionHeader
            align="left"
            eyebrow="Contact"
            title="Let's talk. We'd love to hear from you"
            description="Have a question, an idea, or just want to say hello? Send us a message and we'll get back to you."
          />
          <ul className="mt-8 flex flex-col gap-4">
            <li className="flex items-center gap-3 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#367C52] text-white">
                <Mail size={16} aria-hidden="true" />
              </span>
              <a
                href="mailto:hello@kinora.example"
                className="font-medium hover:text-[#367C52]"
              >
                hello@kinora.example
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#367C52] text-white">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <span>Jakarta, Indonesia</span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-[#E4EFE8] bg-[#F7FAF8] p-6 sm:p-8">
          {submitted ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <CheckCircle2
                size={44}
                className="text-[#367C52]"
                aria-hidden="true"
              />
              <h3 className="font-heading mt-4 text-xl font-bold tracking-[-0.02em]">
                Thank you{name ? `, ${name}` : ""}!
              </h3>
              <p className="mt-2 max-w-[320px] text-sm leading-[1.65] text-[#0F4125]/70">
                Your message has been received. We&apos;ll be in touch soon.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs font-semibold text-[#367C52] underline-offset-4 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-1.5 block text-xs font-semibold"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-1.5 block text-xs font-semibold"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-xs font-semibold"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-[#080B09] px-[23px] py-3 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1A211C] hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
              >
                Send Message
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[#0F4125]/50">
                Demo form. Messages aren&apos;t sent anywhere yet.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
