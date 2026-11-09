using shop from '../db/schema';

service CatalogService @(path: '/catalog') {

  // Public storefront: only active products, no audit fields.
  @readonly
  entity Products as
    select from shop.Products {
      sku, name, description, category, price, currency, stock, imageUrl
    } where active = true;

  type OrderLine { sku : String(30); quantity : Integer; }

  action placeOrder(customerName  : String,
                    customerEmail : String,
                    items         : many OrderLine)
    returns { orderID : UUID; total : Decimal(12, 2); currency : String(3); status : String };
}
