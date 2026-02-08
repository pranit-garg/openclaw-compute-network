/**
 * Polyfills for React Native environment.
 * Must be imported before any code that uses Buffer or crypto.
 *
 * React Native doesn't have Node.js globals like Buffer,
 * so we pull them in from the `buffer` npm package.
 */
import "react-native-get-random-values";
import { Buffer } from "buffer";

// Make Buffer globally available (tweetnacl and other libs expect it)
if (typeof global !== "undefined") {
  (global as Record<string, unknown>).Buffer = Buffer;
}
