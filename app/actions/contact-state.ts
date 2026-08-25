/**
 * The form's state shape lives here rather than beside the action, because a
 * module carrying "use server" may only export async functions. A plain `const`
 * exported from there is stripped from the client bundle and arrives as
 * undefined.
 */
export type ContactField = "name" | "email" | "intent" | "message";

export type ContactState = {
  status: "idle" | "success" | "error";
  /** Shown above the submit row. Empty while the form is untouched. */
  message: string;
  errors: Partial<Record<ContactField, string>>;
};

export const INITIAL_CONTACT_STATE: ContactState = {
  status: "idle",
  message: "",
  errors: {},
};
