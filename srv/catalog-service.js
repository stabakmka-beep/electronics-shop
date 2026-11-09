const cds = require('@sap/cds')

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    const { Products, Customers, Orders } = cds.entities('shop')

    this.on('placeOrder', async req => {
      const { customerName, customerEmail, items } = req.data

      if (!customerName?.trim() || !customerEmail?.trim())
        return req.reject(400, 'Customer name and email are required')
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail))
        return req.reject(400, 'Invalid email address')
      if (!items?.length)
        return req.reject(400, 'Order must contain at least one item')

      // Merge duplicate SKUs and validate quantities
      const wanted = new Map()
      for (const { sku, quantity } of items) {
        if (!sku || !Number.isInteger(quantity) || quantity < 1)
          return req.reject(400, `Invalid line for SKU "${sku}"`)
        wanted.set(sku, (wanted.get(sku) || 0) + quantity)
      }

      // Everything below runs in ONE transaction. Any reject rolls back all stock changes.
      const lines = []
      let total = 0
      let currency

      for (const [sku, quantity] of wanted) {
        // Atomic check-and-decrement: succeeds only if enough stock remains,
        // so two customers cannot buy the last unit at the same time.
        const updated = await UPDATE(Products)
          .set({ stock: { '-=': quantity } })
          .where({ sku, active: true, stock: { '>=': quantity } })
        if (!updated) {
          const exists = await SELECT.one.from(Products).columns('sku').where({ sku, active: true })
          return req.reject(exists ? 409 : 404,
            exists ? `Not enough stock for ${sku}` : `Unknown product ${sku}`)
        }
        const p = await SELECT.one.from(Products).columns('price', 'currency').where({ sku })
        const unitPrice = Number(p.price)
        const lineTotal = Math.round(unitPrice * quantity * 100) / 100
        currency ??= p.currency
        total = Math.round((total + lineTotal) * 100) / 100
        lines.push({ ID: cds.utils.uuid(), product_sku: sku, quantity, unitPrice, lineTotal })
      }

      // Find or create the customer by email
      let customer = await SELECT.one.from(Customers).columns('ID').where({ email: customerEmail })
      if (!customer) {
        customer = { ID: cds.utils.uuid(), name: customerName, email: customerEmail }
        await INSERT.into(Customers).entries(customer)
      }

      const orderID = cds.utils.uuid()
      await INSERT.into(Orders).entries({
        ID: orderID, customer_ID: customer.ID, status: 'New', total, currency, items: lines
      })

      return { orderID, total, currency, status: 'New' }
    })

    return super.init()
  }
}
