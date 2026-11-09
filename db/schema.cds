namespace shop;

using { cuid, managed } from '@sap/cds/common';

// SKU is the key so re-importing the Excel file updates rows instead of duplicating them.
entity Products : managed {
  key sku      : String(30);
  name         : String(120) @mandatory;
  description  : String(1000);
  category     : String(60);
  price        : Decimal(10, 2) @mandatory;
  currency     : String(3) default 'USD';
  stock        : Integer default 0;
  imageUrl     : String(500);
  active       : Boolean default true;
}

entity Customers : cuid, managed {
  name    : String(120) @mandatory;
  email   : String(200) @mandatory;
  phone   : String(40);
  address : String(500);
}

entity Orders : cuid, managed {
  customer : Association to Customers;
  status   : String(20) default 'New'; // New, Paid, Shipped, Delivered, Cancelled
  total    : Decimal(12, 2);
  currency : String(3);
  items    : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : cuid {
  order     : Association to Orders;
  product   : Association to Products;
  quantity  : Integer;
  unitPrice : Decimal(10, 2);
  lineTotal : Decimal(12, 2);
}
