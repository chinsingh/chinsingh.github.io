---
title: Cut Save Time Using Salesforce's Composite Graph API
date: 2026-01-12
display_date: January 12, 2026
section: Field Notes
field: Software
draft: false
---

One of the tools I work on allows customizing hundreds of products via AI, all of them being saved to a Salesforce org. Each entry required a `Product2` record plus `PricebookEntry` records for the standard and selected pricebooks. The existing logic handled this with the standard Composite API, which worked fine till the product customizations were manual and limited. Once we introduced AI into the mix, it allowed for bulk customization, requiring a 'save' for all the products. For larger sets, the save was noticeably slow, sometimes several seconds.


```d2
Product2 -> PricebookEntry: has
Pricebook2 -> PricebookEntry: lists
Pricebook2: {
  shape: sql_table
  Type: "Standard or Custom"
}
```


## Too Many Round-Trips

The standard Composite API (`/services/data/v*/composite`) has a hard limit of 25 subrequests per request.

For each product we need:

- 1 subrequest for Product2
- 1 subrequest for the Standard PricebookEntry
- N subrequests for custom pricebook entries

So with 5 custom pricebooks, each product uses 7 subrequests: fitting only 3 products per batch (25 ÷ 7 ≈ 3). Saving 30 products meant 10 sequential round-trips, each adding its own network latency.

```js
const subrequestsPerProduct = 1 + 1 + customPricebooks.length;
const batchSize = Math.floor(25 / subrequestsPerProduct); // Often 3-8 products
```

## Composite Graph API + sObject Collections

We moved to the Composite Graph API (`/services/data/v56.0/composite/graph`) for Product2 creation, and sObject collections (`/composite/sobjects`) for PricebookEntries.

- **Product2**: one graph per product, all sent in a single API call. Products are created in parallel without sharing the 25-subrequest limit.
- **PricebookEntries**: sObject collections support up to 200 records per request, so all Standard and Selected PricebookEntries go in one or two calls.

```js
// 1) Create all Product2s via composite/graph (parallel graphs)
const graphResp = await sendRequest(req, `/services/data/v56.0/composite/graph`, POST, graphPayload);

// 2) Create all Standard PricebookEntries (up to 200 per request)
await sendRequest(req, `/services/data/v56.0/composite/sobjects`, POST, { records: stdRecords });

// 3) Create Selected PricebookEntries (if different from standard)
if (shouldCreateSelectedPbe) {
  await sendRequest(req, `/services/data/v56.0/composite/sobjects`, POST, { records: selRecords });
}
```

2-3 API calls total, regardless of how many products.

## Time Savings

| Scenario | Old (Composite) | New (Graph + sObject) |
|---|---|---|
| 10 products, 0 custom pricebooks | 2 round-trips | 2 round-trips |
| 10 products, 5 custom pricebooks | 4 round-trips | 2 round-trips |
| 30 products, 5 custom pricebooks | 10 round-trips | 2-3 round-trips |
| 50 products | ~17 round-trips | 2-3 round-trips |

Each round-trip adds roughly 100-300 ms. For 30 products, that's about 2-3 seconds saved per save.

## A Few Design Choices Worth Noting

**Separate graphs per product**: each product gets its own graph so one failure doesn't roll back the others. Users still get partial success when some products fail.

**sObject collections with `allOrNone: false`**: lets us create up to 200 PricebookEntries per call while still handling per-record failures gracefully.

**Only the selected pricebook**: we create PricebookEntries for the standard pricebook and the selected one, not every custom pricebook. Keeps things simple for the main use case.

## Takeaways

The Composite Graph API removes the 25-subrequest ceiling by running graphs in parallel. Combined with sObject collections for bulk child records, you go from N round-trips to 2-3 regardless of scale. If you're building similar batch operations on Salesforce, it's worth the switch.
