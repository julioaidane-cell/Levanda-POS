/**
 * Single entry point the axios layer uses to report an expired session.
 *
 * The auth store registers a handler on boot; when any request comes back 401
 * the client invokes it, which clears the persisted session and redirects to
 * the login screen. Using a callback instead of importing the store directly
 * keeps the API layer free of app-state dependencies.
 */

type UnauthorizedHandler = () => void | Promise<void>;

let handler: UnauthorizedHandler | null = null;
let notifying = false;

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
}

/** Guards against a burst of parallel 401s triggering repeated sign-outs. */
export async function notifyUnauthorized(): Promise<void> {
  if (notifying) return;
  notifying = true;
  try {
    await handler?.();
  } finally {
    notifying = false;
  }
}