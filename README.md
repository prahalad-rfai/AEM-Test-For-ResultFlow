# AEM test for ResultFlow
An AEM website to test user activity/engagement and testing ResultFlow's data injection SDK for collecting user data.

## Installation

```sh
clone this repo, and install any necessary packages to run commands
```

## Linting

```sh
npm run lint
```

## Local development

run 'npm run start' to test the local server

  Key pages to test the full purchase flow:

  ┌────────────────────┬───────────────────────────────────────────────┐
  │        Page        │                      URL                      │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Home               │ http://localhost:3000                         │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Running collection │ http://localhost:3000/collections/running     │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Product detail     │ http://localhost:3000/products/air-runner-pro │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Cart               │ http://localhost:3000/cart                    │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Checkout           │ http://localhost:3000/checkout                │
  ├────────────────────┼───────────────────────────────────────────────┤
  │ Order confirmation │ http://localhost:3000/order-confirmation      │
