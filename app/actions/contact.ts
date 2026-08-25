"use server";

import { INTENTS } from "../data/contact";
import type { ContactField, ContactState } from "./contact-state";

/** Deliberately loose. Real deliverability is proven by the reply, not a regex. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function read(formData: FormData, key: ContactField) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = read(formData, "name");
  const email = read(formData, "email");
  const intent = read(formData, "intent");
  const message = read(formData, "message");

  // Honeypot. A human never sees this field, so anything in it is a bot.
  // Answer with the success shape so the bot has nothing to tune against.
  if (typeof formData.get("company") === "string" && formData.get("company")) {
    return { status: "success", message: "", errors: {} };
  }

  const errors: ContactState["errors"] = {};

  if (name.length < 2) errors.name = "Tell me your name.";
  else if (name.length > 80) errors.name = "That name is too long.";

  if (!email) errors.email = "I need an address to reply to.";
  else if (!EMAIL.test(email)) errors.email = "That address looks incomplete.";

  if (!INTENTS.some((option) => option.value === intent)) {
    errors.intent = "Pick one so I know where to start.";
  }

  if (message.length < 10) errors.message = "A sentence or two, at least.";
  else if (message.length > 4000) errors.message = "That is over 4000 characters.";

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Some details are missing.",
      errors,
    };
  }

  // Transport seam. Set CONTACT_ENDPOINT to any service that accepts a JSON
  // POST (Formspree, Resend via a route, n8n, a Worker). Nothing here is
  // provider-specific, so swapping services never touches this file.
  const endpoint = process.env.CONTACT_ENDPOINT;

  if (!endpoint) {
    console.warn(
      "[contact] CONTACT_ENDPOINT is not set, so the message was not delivered.",
    );

    return {
      status: "error",
      message: "unconfigured",
      errors: {},
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        intent,
        message,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Endpoint responded ${response.status}`);
    }
  } catch (error) {
    console.error("[contact] delivery failed", error);

    return {
      status: "error",
      message: "transport",
      errors: {},
    };
  }

  return { status: "success", message: "", errors: {} };
}
