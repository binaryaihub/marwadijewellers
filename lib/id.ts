// Compact, URL-safe order ID (~12 chars, time-prefixed for sortability).
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newOrderId(): string {
  const time = Date.now().toString(36).toUpperCase();
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${time}${rand}`;
}
