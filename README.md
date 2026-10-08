# 8tshirts

A pre-order t-shirt shop. Visitors browse, add shirts to their cart, edit the cart, and leave an email to reserve it. Nobody pays online. The owner reads the carts to know how many of each design, size and colour to produce.

Built on [EverShop](https://evershop.io) 2.3 (Node.js, TypeScript, React, Postgres), hosted on Render, with Neon for the database and Cloudflare R2 for product photos.

## What's in here

| Path | What it is |
| --- | --- |
| `extensions/reserve/` | Cart-page form: "Reserve these items" with an email field. Saves to the cart's built-in `customer_email` through core's `POST /api/carts/:cart_id/contacts`. |
| `config/default.json` | Enables the `reserve` extension. |
| `config/production.json` | Makes uploads go to S3-compatible storage (R2) in production. |
| `sql/carted-items.sql` | The two owner queries: units per SKU (reserved vs anonymous) and who reserved what. |
| `render.yaml` | Render Blueprint for the web service. |
| `.env.example` | Every environment variable the app needs. |

## Run locally

Needs Node 20+ and a Postgres database (a Neon dev branch works).

```bash
npm install
cp .env.example .env        # fill in DB_*
npm run compile:ext         # compile the extension once
npm run dev                 # http://localhost:3000, admin at /admin
npm run user:create -- --email "you@example.com" --password "SomethingLong1" --name "You"
```

The first start creates all tables in an empty database. `npm run dev` stores uploads in `media/`. `npm run build && npm run start` runs production mode, which sends uploads to R2, so it needs the `AWS_*` variables.

## Deploy

### 1. Neon

Create a project and a database named `shop`. Copy the **direct** connection host (not the `-pooler` one).

### 2. Cloudflare R2

1. Create a bucket, e.g. `tshirt-media`.
2. Give it a public URL: a custom domain (recommended) or the `r2.dev` subdomain (rate-limited, fine for testing).
3. Create an R2 API token with Object Read & Write on that bucket only.

### 3. Render

1. New → Blueprint → pick this repo. Render reads `render.yaml`.
2. Fill in the variables marked `sync: false` (values from Neon and R2).
3. Deploy. The first start creates the schema in Neon.
4. Create the admin user once, from your laptop with the Neon variables in `.env`:
   `npm run user:create -- --email ... --password ... --name ...`

**Instance size:** EverShop runs three Node processes (web, events, cron) at about 520 MB together when idle, measured locally. The 512 MB free and starter instances are too small, so `render.yaml` asks for `standard` (1 CPU, 2 GB).

**Photos:** EverShop saves each image's full URL when you upload it. Set `AWS_S3_BASE_URL` to its final value before uploading product photos.

## Set up the shop (Admin → Settings)

- Store name, logo, currency (THB).
- Payment: enable Cash on Delivery and rename it "Pre-order, pay later" (only matters for visitors who use checkout).
- Shipping: one zone with a free "Delivery arranged later" method.
- Catalog: create `size` and `color` select attributes, then one product per design with a variant group on size × colour. Give variants readable SKUs like `LOGO-BLK-M`. Turn stock management off so nothing shows as sold out.

Shoppers must pick a size and colour on the product page before "Add to cart" works; that's EverShop's default behaviour for variant products.

## See demand

Open Neon's SQL editor and run `sql/carted-items.sql`:

1. Units per SKU, split into **reserved** (an email was left) and **anonymous**.
2. A contact list of who reserved what.

Items a visitor removed are deleted from the cart, so they never count.
