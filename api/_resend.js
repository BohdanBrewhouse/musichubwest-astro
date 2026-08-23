/**
 * Shared wrapper for Resend SDK calls.
 *
 * The SDK does not throw on API errors — every method resolves with
 * `{ data, error }`. Awaiting inside a try/catch therefore catches nothing, and
 * a rejected call looks exactly like success. That is how a broken newsletter
 * signup logged "email sent" for days, and why the same pattern in the other
 * endpoints was worth fixing: `daily_quota_exceeded` is a plain error response,
 * so hitting the sending cap would silently drop event confirmations.
 *
 * Returns the error object, or null when the call succeeded. The try/catch is
 * still needed for genuine network failures, which do reject.
 */
export async function resendCall(label, promise) {
  try {
    const res = await promise;
    if (res?.error) {
      console.error(`[${label}] Resend error:`, res.error.name, res.error.message);
      return res.error;
    }
    return null;
  } catch (err) {
    console.error(`[${label}] Resend threw:`, err?.message || err);
    return { name: 'network_error', message: String(err?.message || err) };
  }
}
