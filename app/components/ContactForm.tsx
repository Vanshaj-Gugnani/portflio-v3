"use client";

import Script from "next/script";
import {
  type FormEvent,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import ArrowUpRight from "./ArrowUpRight";
import ChevronDown from "./ChevronDown";
import { submitContact } from "../actions/contact";
import {
  INITIAL_CONTACT_STATE,
  type ContactField,
  type ContactState,
} from "../actions/contact-state";
import { INTENTS } from "../data/contact";

type ContactFormProps = {
  /** Pre-built `mailto:` for the fallback line. Null when no address is set. */
  mailto: string | null;
  email: string;
};

const EMPTY = { name: "", email: "", intent: "", message: "" };
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  execute: (widgetId: string) => void;
  remove: (widgetId: string) => void;
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: "contact";
      appearance: "interaction-only";
      execution: "execute";
      responseField: false;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function ContactForm({ mailto, email }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(
    submitContact,
    INITIAL_CONTACT_STATE,
  );
  const [values, setValues] = useState(EMPTY);
  const [dismissed, setDismissed] = useState<ContactState | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const verifiedSubmissionRef = useRef(false);
  const uid = useId();

  // Derived rather than stored: `state` is a fresh object per submission, so
  // dismissing this result never hides the next one.
  const succeeded = state.status === "success" && dismissed !== state;

  const clearTurnstileToken = useCallback(() => {
    if (tokenInputRef.current) tokenInputRef.current.value = "";
    verifiedSubmissionRef.current = false;
  }, []);

  const failTurnstile = useCallback(
    (message: string) => {
      clearTurnstileToken();
      setVerifying(false);
      setTurnstileError(message);
    },
    [clearTurnstileToken],
  );

  const renderTurnstile = useCallback(() => {
    const turnstile = window.turnstile;
    const container = turnstileContainerRef.current;

    if (!turnstile || !container || turnstileWidgetIdRef.current) return;

    if (!TURNSTILE_SITE_KEY) {
      failTurnstile("The security check is not configured yet.");
      return;
    }

    try {
      turnstileWidgetIdRef.current = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "contact",
        appearance: "interaction-only",
        execution: "execute",
        responseField: false,
        callback: (token) => {
          const form = formRef.current;
          const tokenInput = tokenInputRef.current;

          if (!form || !tokenInput) return;

          tokenInput.value = token;
          verifiedSubmissionRef.current = true;
          setVerifying(false);
          setTurnstileError("");
          form.requestSubmit();
        },
        "error-callback": () => {
          failTurnstile("The security check failed. Please try again.");
        },
        "expired-callback": () => {
          failTurnstile("The security check expired. Please try again.");
        },
        "timeout-callback": () => {
          failTurnstile("The security check timed out. Please try again.");
        },
      });
      setTurnstileReady(true);
    } catch {
      failTurnstile("The security check could not load. Please refresh.");
    }
  }, [failTurnstile]);

  useEffect(() => {
    // React resets the form's controls once an action settles. Our state did
    // not change, so React re-renders the same `value` props and never writes
    // them back to the DOM: the answer stays on screen while the control behind
    // it is empty, and the next submit sends nothing. `<select>` loses its
    // choice this way. Re-sync from state so a retry sends what is displayed.
    const form = formRef.current;

    // Null while the confirmation is showing in place of the form.
    if (!form) return;

    for (const [field, value] of Object.entries(values)) {
      const control = form.elements.namedItem(field);

      if (
        (control instanceof HTMLInputElement ||
          control instanceof HTMLSelectElement ||
          control instanceof HTMLTextAreaElement) &&
        control.value !== value
      ) {
        control.value = value;
      }
    }

    clearTurnstileToken();
    const turnstile = window.turnstile;
    const widgetId = turnstileWidgetIdRef.current;

    if (!turnstile || !widgetId) return;

    if (state.status === "error") {
      turnstile.reset(widgetId);
    }
    // Re-syncing is a response to the action settling, so `state` is the only
    // trigger; `values` is read for its current contents, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(
    () => () => {
      const turnstile = window.turnstile;
      const widgetId = turnstileWidgetIdRef.current;

      if (turnstile && widgetId) turnstile.remove(widgetId);
    },
    [],
  );

  const fieldId = (field: ContactField) => `${uid}-${field}`;
  const errorId = (field: ContactField) => `${uid}-${field}-error`;

  const set = (field: ContactField) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (verifiedSubmissionRef.current) {
      verifiedSubmissionRef.current = false;
      return;
    }

    event.preventDefault();
    clearTurnstileToken();
    setTurnstileError("");

    const turnstile = window.turnstile;
    const widgetId = turnstileWidgetIdRef.current;

    if (!turnstile || !widgetId) {
      failTurnstile("The security check is still loading. Please try again.");
      return;
    }

    setVerifying(true);

    try {
      turnstile.execute(widgetId);
    } catch {
      failTurnstile("The security check could not start. Please try again.");
    }
  };

  const handleReset = () => {
    const turnstile = window.turnstile;
    const widgetId = turnstileWidgetIdRef.current;

    if (turnstile && widgetId) turnstile.reset(widgetId);
    clearTurnstileToken();
    setTurnstileError("");
    setDismissed(state);
    setValues(EMPTY);
  };

  return (
    <form
      className="contact-form"
      action={formAction}
      data-success={succeeded ? "true" : undefined}
      noValidate
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <Script
        id="cloudflare-turnstile"
        onReady={renderTurnstile}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />

      <input
        name="cf-turnstile-response"
        ref={tokenInputRef}
        type="hidden"
      />

      {/* Honeypot. Off-screen rather than display:none so bots still fill it. */}
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor={fieldId("name") + "-company"}>Company</label>
        <input
          autoComplete="off"
          disabled={succeeded}
          id={fieldId("name") + "-company"}
          name="company"
          tabIndex={-1}
          type="text"
        />
      </div>

      <p className="contact-letter">
        <span className="contact-word">Hi Vanshaj, my name is</span>{" "}
        <Blank
          autoComplete="name"
          disabled={succeeded}
          error={state.errors.name}
          errorId={errorId("name")}
          field="name"
          id={fieldId("name")}
          label="Your name"
          onChange={set("name")}
          sizeHint="your name"
          value={values.name}
        />{" "}
        <span className="contact-word">and I want to talk about</span>{" "}
        <span
          className="contact-blank contact-blank-select"
          data-empty={values.intent ? undefined : "true"}
          data-invalid={state.errors.intent ? "true" : undefined}
        >
          <label className="contact-blank-label" htmlFor={fieldId("intent")}>
            What it is about
          </label>
          <span className="contact-blank-field">
            <span className="contact-blank-sizer" aria-hidden="true">
              {values.intent || "what exactly"}
            </span>
            <select
              aria-describedby={
                state.errors.intent ? errorId("intent") : undefined
              }
              aria-invalid={state.errors.intent ? true : undefined}
              disabled={succeeded}
              id={fieldId("intent")}
              name="intent"
              onChange={(event) => set("intent")(event.target.value)}
              value={values.intent}
            >
              <option value="">what exactly</option>
              {INTENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="contact-chevron" aria-hidden="true">
              <ChevronDown />
            </span>
          </span>
          {state.errors.intent ? (
            <span className="contact-blank-error" id={errorId("intent")}>
              {state.errors.intent}
            </span>
          ) : null}
        </span>
        <span className="contact-word">.</span>{" "}
        <span className="contact-word">You can reach me at</span>{" "}
        <Blank
          autoComplete="email"
          disabled={succeeded}
          error={state.errors.email}
          errorId={errorId("email")}
          field="email"
          id={fieldId("email")}
          inputMode="email"
          label="Your email"
          onChange={set("email")}
          sizeHint="you@studio.com"
          type="email"
          value={values.email}
        />
        <span className="contact-word">.</span>
      </p>

      <div
        className="contact-message"
        data-invalid={state.errors.message ? "true" : undefined}
      >
        <label htmlFor={fieldId("message")}>Message (optional)</label>
        <textarea
          aria-describedby={
            state.errors.message ? errorId("message") : `${uid}-message-help`
          }
          aria-invalid={state.errors.message ? true : undefined}
          disabled={succeeded}
          id={fieldId("message")}
          name="message"
          onChange={(event) => set("message")(event.target.value)}
          rows={4}
          value={values.message}
        />
        {state.errors.message ? (
          <p className="contact-blank-error" id={errorId("message")}>
            {state.errors.message}
          </p>
        ) : (
          <p className="contact-help" id={`${uid}-message-help`}>
            Optional — scope, timeline, anything relevant.
          </p>
        )}
      </div>

      <div className="contact-foot">
        <div className="contact-turnstile" ref={turnstileContainerRef} />

        {succeeded ? (
          <div aria-live="polite" className="contact-sent" role="status">
            <div>
              <p className="contact-sent-kicker">Message sent</p>
              <p className="contact-sent-copy">
                I&apos;ll reply to <span>{values.email}</span>.
              </p>
            </div>
            <button
              className="contact-reset"
              onClick={handleReset}
              type="button"
            >
              Send another
            </button>
          </div>
        ) : (
          <>
            <button
              aria-busy={pending || verifying}
              className="contact-submit"
              disabled={pending || verifying || !turnstileReady}
              type="submit"
            >
              <span>
                {pending ? "Sending" : verifying ? "Checking" : "Send message"}
              </span>
              <span className="contact-submit-mark">
                <ArrowUpRight />
              </span>
            </button>

            <p aria-live="polite" className="contact-note">
              {turnstileError ? (
                turnstileError
              ) : state.status === "error" ? (
                <FormNote email={email} mailto={mailto} message={state.message} />
              ) : null}
            </p>
          </>
        )}
      </div>
    </form>
  );
}

function FormNote({
  email,
  mailto,
  message,
}: {
  email: string;
  mailto: string | null;
  message: string;
}) {
  if (message === "security") {
    return <>The security check is not configured yet.</>;
  }

  if (message === "unconfigured" || message === "transport") {
    const lead =
      message === "unconfigured"
        ? "That did not send, the inbox is not connected yet."
        : "Something went wrong sending that.";

    return (
      <>
        {lead}
        {mailto ? (
          <>
            {" You can email me directly at "}
            <a href={mailto}>{email}</a>.
          </>
        ) : null}
      </>
    );
  }

  return <>{message}</>;
}

type BlankProps = {
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  errorId: string;
  field: ContactField;
  id: string;
  inputMode?: "email" | "text";
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Ghost text that gives an empty blank a sensible width. */
  sizeHint: string;
  type?: string;
  value: string;
};

/**
 * One ruled blank in the sentence. The sizer span and the input share a single
 * inline-grid cell, so the blank grows with what is typed instead of sitting at
 * a fixed width that either truncates a long address or leaves a gap after a
 * short name.
 */
function Blank({
  autoComplete,
  disabled,
  error,
  errorId,
  field,
  id,
  inputMode,
  label,
  onChange,
  placeholder,
  sizeHint,
  type = "text",
  value,
}: BlankProps) {
  return (
    <span className="contact-blank" data-invalid={error ? "true" : undefined}>
      <label className="contact-blank-label" htmlFor={id}>
        {label}
      </label>
      <span className="contact-blank-field">
        <span className="contact-blank-sizer" aria-hidden="true">
          {value || sizeHint}
        </span>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          disabled={disabled}
          id={id}
          inputMode={inputMode}
          name={field}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </span>
      {error ? (
        <span className="contact-blank-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
