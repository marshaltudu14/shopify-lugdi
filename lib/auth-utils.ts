import crypto from "crypto";

// Generate a random code verifier
export async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(Buffer.from(array).toString("base64"));
}

// Generate a code challenge from the verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64UrlEncode(hash.toString("base64"));
}

// Generate a state parameter
export async function generateState(): Promise<string> {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

// Generate a nonce
export async function generateNonce(length: number = 16): Promise<string> {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    nonce += characters[randomIndex];
  }
  return nonce;
}

// Base64 URL encode
export function base64UrlEncode(str: string): string {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
