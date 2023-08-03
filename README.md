# Url shortener for Cloudflare Pages

Features

- no database needed: only uses Cloudflare Workers KV
- caching for redirects
- good-looking UI
- permanent links

# Setup

- fork this project on GitHub
- create a new KV namespace on Cloudflare
- create a new Pages project and select the repository you just forked
- under "Framework preset" select "SvelteKit"
- add a new environment variable called "APP_SECRET" with a value of your choice (recommended 256-bit entropy)
- wait for the app to build
- in the project settings add a new KV namespace binding with the name DATA and the namespace you created before
- redeploy the app by clicking the three dots and "Retry deployment" on the current deployment (idk why but the interface doesn't let you set KV namespace bindings before deploying)
- remember to pull the changes from this repository every now and then

## Logging into the dashboard

For authentication, you are free to create any JWT token using the secret added during the setup (payload can be empty and the expiration date will be respected) (you can use [jwt.io](https://jwt.io/)).

When you have got a token, go to /dashboard?token=TOKEN_YOU_CREATED and you should see the UI (the token is stored in cookies, clear the cookies if you want to log out)
