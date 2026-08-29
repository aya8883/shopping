# Architecture notes (Phase 1–2)

## Design principles (AuditQ-aligned)

- GraphQL-first via Hasura
- PostgreSQL as system of record
- SuperTokens for auth; app profile UUID in Hasura claims
- React feature folders; no supermarket-specific branching in comparison logic
- Custom Node services only for non-CRUD workflows

## Canonical catalogue

`products` is supermarket-agnostic. Prices live in `supermarket_offers`.

Adding Panda/Danube later = new `supermarkets` row + offers/leaflets — not new product rows per chain.

## Roles

| Role | Access |
| --- | --- |
| anonymous | Read active catalogue / offers |
| consumer | Own lists, favorites, alerts, profile |
| reviewer | Match/offer review |
| admin | Full access |

## Next custom Actions (Phase 4+)

- `compareBasket`
- `optimizeBasket`
- `processLeaflet`
- `suggestProductMatch`
- `calculateEffectivePrice`
- `createPriceAlert`
