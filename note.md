:3000/\_next/static/c…ks/app/layout.js:29 Uncaught SyntaxError: Invalid or unexpected token

FirebaseError: "auth/invalid-action-code" "Firebase: Error (auth/invalid-action-code)."

src/components/auth/VerifyEmailForm.tsx (65:21) @ VerifyEmailForm.useEffect.verifyEmail

63 | } catch (error: unknown) {
64 | if (isFirebaseError(error)) {

> 65 | console.error("FirebaseError:", error.code, error.message);

     |                     ^

66 |
67 | if (error.code === "auth/invalid-action-code") {
68 | const user = auth.currentUser;
Call Stack
4

Show 3 ignore-listed frame(s)
VerifyEmailForm.useEffect.verifyEmail
