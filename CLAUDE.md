# Electronics shop (SAP BTP, standalone)

Customers order electronic items through an internet portal. Standalone: no S/4HANA integration.
This project is the system of record for products, stock, customers and orders.

## Stack
- Backend: SAP CAP, Node.js (`db/schema.cds`, `srv/catalog-service.*`)
- DB: SQLite locally; SAP HANA Cloud or PostgreSQL on BTP later
- Planned: storefront (React/Next.js), customer login (SAP Cloud Identity Services), payment provider (webhook), admin app (Fiori Elements), MTA deployment to Cloud Foundry

## Conventions
- Product key is `sku`; Excel re-imports must update, never duplicate.
- Stock changes only through atomic check-and-decrement inside one transaction (see `placeOrder`).
- Mock data comes from `data/mock-data.xlsx` -> `npm run import` -> `db/data/shop-Products.csv`.
- Currency USD is a placeholder assumption.

## Commands
- `npm install`, `npm run import`, `npm run watch` (http://localhost:4004), `npm test`

## Next steps
1. Admin service (Products, Orders, Customers) + Fiori Elements app
2. Storefront UI: product list, cart, checkout
3. Customer accounts and auth
4. Payment provider integration
5. `cds add mta,hana,xsuaa` and deploy
