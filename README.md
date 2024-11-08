# mfe-arch-exp

## Getting Started

### Setup

1. Find `apps/root-config/public/example-auth.json`.
2. Rename it to just `auth.json` and update the following:

- authority
- issuer
- client_id

3. You will see redirect urls in the config already. Make sure your auth provider is set up to allow these.

### Usage

1. Open a terminal, make sure you are at the root directory.
2. Run `npm install`.
3. Run `npm run root`
4. Open another terminal tab or window and run `npm run app1`.
5. Open another terminal tab or window and run `npm run login`.
6. Open a browser, and go to `http://localhost:4200`.
7. You should be redirected to your auth provider to login.
8. After logging in, you should be redirected to the home root with a welcome message. Success!
9. You can click "logout" to be logged out manually.
10. If you go idle, a timer will start on the screen. Once it reaches zero, you will be logged out and redirected to "/login".
