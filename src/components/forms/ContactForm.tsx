"use client";

import { useState } from "react";
import { BACKEND_URL } from "@/lib/constants";

const DRAFT_KEY = "contactFormDraft";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
}

const empty: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(() => {
    // Restore draft saved during the same browser session (runs only on client)
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        try { return JSON.parse(saved) as FormState; } catch { /* ignore */ }
      }
    }
    return empty;
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error" | "network-error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      // Step 1: get CSRF token
      const csrfRes = await fetch(`${BACKEND_URL}/contact/csrf-token.php`);
      const { token } = await csrfRes.json();

      // Step 2: submit form
      const data = new FormData();
      data.append("ajax", "1");
      data.append("csrf_token", token);
      data.append("first_name", form.firstName);
      data.append("last_name", form.lastName);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("message", form.message);
      data.append("consent", form.consent ? "1" : "0");
      data.append("consent_ts", Math.floor(Date.now() / 1000).toString());

      const res = await fetch(`${BACKEND_URL}/contact/contact.php`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (json.status === "ok") {
        setStatus("success");
        sessionStorage.removeItem(DRAFT_KEY);
        setForm(empty);
      } else {
        setStatus("error");
        setErrorMessage(json.message ?? "Submission failed.");
      }
    } catch {
      setStatus("network-error");
      setErrorMessage("A network error occurred. Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input type="text" name="website" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cf-first-name">First Name</label>
          <input
            id="cf-first-name"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            required
            autoComplete="given-name"
            placeholder="First Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cf-last-name">Last Name</label>
          <input
            id="cf-last-name"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            required
            autoComplete="family-name"
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cf-phone">Phone (optional)</label>
        <input
          id="cf-phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          autoComplete="tel"
          placeholder="+65 9123 4567"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          required
          placeholder="Tell me about your project…"
        />
      </div>

      <div className="form-group form-group--checkbox">
        <input
          id="cf-consent"
          name="consent"
          type="checkbox"
          checked={form.consent}
          onChange={handleChange}
          required
        />
        <label htmlFor="cf-consent">
          I agree to be contacted regarding my enquiry.
        </label>
      </div>

      {/* Feedback */}
      {status === "success" && (
        <div role="status" className="form-success">
          Message sent! Thank you for reaching out.
        </div>
      )}
      {(status === "error" || status === "network-error") && (
        <div role="alert" className="form-error">
          {errorMessage || "Submission failed. Please try again."}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn--primary"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
