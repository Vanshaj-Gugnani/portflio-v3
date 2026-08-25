"use server";

import nodemailer from "nodemailer";
import { headers } from "next/headers";
import { INTENTS } from "../data/contact";
import type { ContactField, ContactState } from "./contact-state";

/** Deliberately loose. Real deliverability is proven by the reply, not a regex. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TURNSTILE_ACTION = "contact";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

function read(formData: FormData, key: ContactField) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function verifyTurnstile(
  token: FormDataEntryValue | null,
): Promise<"valid" | "invalid" | "unconfigured"> {
  const secret = process.env.TURNSTILE_SECRET;
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!secret || expectedHostnames.size === 0) {
    console.warn(
      "[contact] TURNSTILE_SECRET or TURNSTILE_HOSTNAMES is not configured.",
    );
    return "unconfigured";
  }

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return "invalid";
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const remoteIp =
    requestHeaders.get("cf-connecting-ip") ??
    forwardedFor?.split(",")[0]?.trim();
  const body = new URLSearchParams({ secret, response: token });

  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) throw new Error(`Siteverify responded ${response.status}`);

    const result = (await response.json()) as TurnstileResponse;
    const valid =
      result.success === true &&
      result.action === TURNSTILE_ACTION &&
      typeof result.hostname === "string" &&
      expectedHostnames.has(result.hostname.toLowerCase());

    if (!valid) {
      console.warn("[contact] Turnstile rejected a submission", {
        action: result.action,
        errorCodes: result["error-codes"],
        hostname: result.hostname,
      });
    }

    return valid ? "valid" : "invalid";
  } catch (error) {
    console.error("[contact] Turnstile verification failed", error);
    return "invalid";
  }
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

  if (message.length > 4000) {
    errors.message = "That is over 4000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Some details are missing.",
      errors,
    };
  }

  const turnstile = await verifyTurnstile(
    formData.get("cf-turnstile-response"),
  );

  if (turnstile !== "valid") {
    return {
      status: "error",
      message:
        turnstile === "unconfigured"
          ? "security"
          : "Verification failed. Please try again.",
      errors: {},
    };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const contactTo = process.env.CONTACT_TO_EMAIL;

  if (!gmailUser || !gmailAppPassword || !contactTo) {
    console.warn(
      "[contact] Gmail sender or contact recipient is not configured.",
    );

    return {
      status: "error",
      message: "unconfigured",
      errors: {},
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    await transporter.sendMail({
      from: { name: "Portfolio contact", address: gmailUser },
      to: contactTo,
      replyTo: email,
      subject: `Portfolio inquiry — ${intent}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Interested in: ${intent}`,
        "",
        message || "(No message provided.)",
        "",
        `Submitted: ${new Date().toISOString()}`,
      ].join("\n"),
    });
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
