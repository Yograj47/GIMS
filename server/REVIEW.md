Server review completed on 17 November 2026 on the pre-deploy branch.

The review covered authentication, customer account ownership, staff permissions, socket authentication and broadcasts, checkout reservations and fulfillment, payment verification, billing precision, product pricing, media storage and migration, and request validation. Confirmed issues were corrected and regression checks were added.

| Finding | Severity | Result |
| --- | --- | --- |
| The role update response included the stored password hash and could include OTP fields | High | The response now explicitly selects public account fields |
| HTTP and socket authentication duplicated session checks, and password resets left old tokens valid | High | Both transports use the same session validation. Password changes, resets, role changes, logout, and account deletion invalidate previous sessions |
| Internal alert and presence events were broadcast to customer sockets | High | Internal broadcasts use a workspace room. Verified customers receive their own order events |
| Cross-site writes could use the production session cookie without an application origin check | High | Mutation requests check Origin and Fetch Metadata. Socket handshakes enforce the same allowed origins |
| OTP checks and consumption were separate operations, with no per-code failure limit | High | Codes are stored as HMAC digests, consumed atomically, and locked after five failures. Existing unexpired plaintext codes remain compatible |
| Authentication and OTP endpoints lacked request limits | High | Login, registration, and OTP endpoints have rate limits |
| Forgot-password accepted an unvalidated email value | Medium | Shared Zod validation rejects query operators and malformed email input |
| Unverified staff could reach endpoints that checked only role permissions | Medium | Permission middleware now also requires account verification |
| Partial product updates could put selling price below the stored cost | Medium | The database update checks the effective cost and selling price atomically |
| Invalid session tokens, malformed identifiers, and invalid JSON could produce server errors | Medium | Invalid sessions return 401. Invalid request data returns 400 and oversized bodies return 413 |
| Legacy test tooling and unused mail dependencies carried security advisories | High | Unused Jest/Babel and Nodemailer packages were removed. Compatible dependency updates were installed |

The server now uses Node's built-in test runner through `npm test`. The run completed with 17 passing tests, zero failures, and zero skipped tests. The inventory integration scenario contains additional assertions covering stock contention, payment retries, role access, customer migration and linking, both fulfillment paths, invoice and supplier accounting, and media ownership and cleanup.

The security integration tests use a temporary MongoDB replica set and real local Socket.IO connections. They verify invalid and expired JWTs, unverified and customer access restrictions, protected role responses, cross-site requests, password session replacement, concurrent OTP consumption, OTP expiry and lockout, socket broadcast isolation, socket disconnection after password changes, login throttling, and logout revocation. Unit tests cover billing precision and bounds, stock availability, reservation behavior, and mobile normalization.

The dependency audit reports zero known vulnerabilities after the dependency changes. This is the registry's advisory result at review time. Email delivery and a real payment-provider transaction were outside the automated run. Payment responses use mocks in the inventory integration test.

The DRY and SOLID review led to shared HTTP/socket session validation, a shared OTP consumption service, and shared origin checks. Controllers retain request and response handling while services enforce account and order rules. The existing checkout router still combines catalog, customer, and staff endpoints. Splitting it into smaller routers is a maintainability follow-up. Inheritance and interface patterns would add little value to these function-based services.

Before deployment, rotate credentials that previously appeared in the tracked server environment file. Ignoring the current file leaves those older values in Git history. Configure the exact frontend origins through `CLIENT_URL` and `CHECKOUT_CLIENT_URL`, and run the server with `NODE_ENV=production` for secure cookies and generic server errors.

Express currently uses its default proxy trust settings. A deployment behind a proxy needs a trust configuration matching the hosting network so IP-based limits and audit addresses identify the client correctly. The rate-limit stores are local to each process. Multiple server replicas would require a shared store to enforce one combined limit.

Some existing Mongoose calls still emit deprecation warnings for `new: true`. They passed the regression suite but should be migrated to `returnDocument: "after"` during routine maintenance.
