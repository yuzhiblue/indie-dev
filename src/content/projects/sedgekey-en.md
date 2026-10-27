---
title: 'SEdgeKey — A Zero-Cost Full-Stack Digital Goods Storefront'
description: 'An all-in-one full-stack card-key storefront deployable to Cloudflare Workers at zero cost: multi-spec SKUs, three fulfillment types, 6 payment gateways (Alipay/Stripe/USDT), discount codes, two-tier affiliate system, bilingual storefront, and an admin panel with TOTP two-factor authentication.'
pubDate: 2026-10-27
updatedDate: 2026-10-27
tags: ['E-commerce', 'Cloudflare', 'Indie Development', 'Storefront', 'Infrastructure']
featured: false
coverImage: '/projects/sedgekey/cover.png'
lang: 'en'
i18nKey: 'sedgekey'
draft: false
---

## Selling Software? You Also Need a Storefront of Your Own

A licensing system solves validation — but indie developers hit the next wall right after: **where to sell**:

- Third-party platforms take 20%+ of every sale, with long payout cycles;
- Template storefront builders lock you in and charge yearly fees;
- Self-hosting a shop on your own server means ops costs and attack surface all yours;
- Taking payments from overseas customers is yet another integration project.

SEdgeKey is an **all-in-one full-stack card-key storefront that deploys straight to Cloudflare**: a single codebase covering the frontend, SSR rendering and backend APIs, running on Cloudflare Workers' edge network — **zero cost, zero ops, and a storefront you own**.

## Battle-Tested Through v1.8.0

This is not a half-finished side project. SEdgeKey is at version 1.8.0, iterated from single-spec products to multi-spec SKUs, from one payment channel to six gateways, from fixed-content delivery to a full affiliate system — every step driven by real selling scenarios.

## Core Capabilities

### Multi-Spec SKUs: One Product, Many Ways to Sell

Configure multiple specs per product, with **price, cost, stock and fulfillment type set independently per SKU**:

- The product page offers a spec selector; price, stock and delivery info update live as buyers switch specs;
- The homepage shows "from (lowest price)" for multi-spec products;
- Categories, publish/unpublish, limited/unlimited stock modes and per-order purchase limits are all supported.

Selling Basic / Pro / Lifetime tiers? One product covers them all.

### Three Fulfillment Types for Every Digital Good

Configured per spec:

- **Auto card-key delivery** — purchased codes are allocated from stock instantly;
- **Fixed-content auto delivery** — download links or redemption instructions delivered automatically;
- **Manual fulfillment** — custom services and physical goods handled by a human.

Card keys are imported in bulk per SKU with dedup, batch numbers, SKU-filtered queries and real-time low-stock alerts; high-concurrency checkout is backed by dedicated indexing, so stock allocation never doubles-sells.

### 6 Payment Gateways: Take Money from Everywhere

Built-in gateways: Alipay (desktop website pay / face-to-face), Epay, Stripe, BEpusdt (USDT) and HashPay — plus native support for free (¥0) orders without any payment config.

QR-code payments for domestic buyers, credit cards and USDT for overseas ones — one storefront takes them all, and the payment fee negotiation stays in your hands.

### Discount Codes + Two-Tier Affiliate: Growth Built In

- **Discount codes**: fixed-amount and percentage types, validated at checkout — run promotions whenever you like;
- **Affiliate system**: promo codes track referrals, commission rates configurable per product or per promoter, with **first-tier and second-tier commissions plus a one-time recruitment bonus** — the settlement panel keeps the books automatically.

That means your users, friends and community can all become your sales channel — no spreadsheet reconciliation required.

### Email Notifications, Media Library, Bilingual Storefront

- **Email notifications**: SMTP / API / Cloudflare Email channels, with automatic buyer notifications on order state changes and full delivery logs;
- **Media library**: images upload directly to Cloudflare KV, managed in the admin panel — no third-party storage service;
- **Bilingual**: the storefront ships with built-in Chinese/English switching.

### Admin Panel: Security by Default

The admin account system ships with **TOTP two-factor authentication**, **Cloudflare Turnstile login captcha** (optional) and operation logs. Credential stuffing and brute-force login attempts get stopped at the system layer.

## A Quick Look

**Buyer storefront** — product listing, spec selection, checkout and order lookup, fully self-service:

![SEdgeKey buyer storefront: product listing](/projects/sedgekey/cover.png)

**Admin panel** — orders, products, card-key stock, payment config and the affiliate system, all in one place:

![SEdgeKey admin panel: dashboard](/projects/sedgekey/admin.png)

## Cost Comparison: Even the Storefront Is Free

| | E-commerce / card platforms | Self-hosted shop | SEdgeKey |
| --- | --- | --- | --- |
| Fees | 10-20%+ per sale | Server bills every month | **$0** (Cloudflare free tier) |
| Payment channels | Platform decides | Integrate yourself | 6 gateways to choose |
| Data ownership | The platform's | Yours | Yours |
| Ops | Managed, but paid | You maintain it | Fully managed |

Combined with self-built payment channels, free-tier email (e.g. Resend, 100 emails/day) and the built-in media library (Cloudflare KV), the whole storefront can run at **100% zero cost** — every sale is pure profit.

## How It Stacks Up

**Versus traditional open-source card-selling systems: more secure.** Open-source storefront code is fully public — anyone can download it and hunt for vulnerabilities. Community security updates are inconsistent at best, and countless forked/modified versions have been abandoned entirely, leaving known holes unpatched for years. SEdgeKey takes the other path: the source is not public, so attackers have no code to study; meanwhile TOTP two-factor authentication, Turnstile login captcha and operation logs are **built in by default** — security doesn't depend on each site owner discovering and patching flaws themselves.

**Versus other lightweight systems on Cloudflare Workers: more complete.** Plenty of Workers-based card-selling tools keep the feature set minimal ("one product, one price, ship a code") to save quota. SEdgeKey runs on the same free tier at the same zero cost — but ships the two capabilities that actually drive sales as standard: **multi-spec SKUs** (tiered pricing per product, with price/stock/fulfillment set per spec) and a **two-tier affiliate system** (first/second-tier commissions plus a one-time recruitment bonus).

| | Traditional open-source systems | Other lightweight Workers tools | SEdgeKey |
| --- | --- | --- | --- |
| Source exposure | Fully public, vulnerabilities visible to all | Varies by project | Closed, no code to study |
| Security hardening | Site owners patch themselves | Minimal | TOTP + Turnstile + operation logs built in |
| Multi-spec SKUs | Rarely supported | Generally absent | Price/stock/fulfillment independent per SKU |
| Two-tier affiliate | Generally absent | Generally absent | First/second-tier commissions + recruitment bonus |
| Deployment cost | Monthly server bills | Free tier | Free tier |

## Who Is It For

- Indie developers selling desktop software, activation codes and membership keys
- Individual sellers of digital resources, tutorials and assets
- Small teams that want to take payments from both domestic and overseas buyers without platform cuts

No ops experience required: after the one-time setup, daily work is just "import card keys, check orders".

## A Storefront + A Licensing System = The Complete Business Loop

SEdgeKey handles payments and delivery; the author's [License Server](/projects/license-server-en/) handles license validation. From checkout to activation, the entire pipeline runs on your own infrastructure — zero platform cuts, zero monthly fees, every byte of data yours.

If you have similar self-hosting needs, feel free to reach out.
