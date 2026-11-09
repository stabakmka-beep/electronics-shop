// Integration test for placeOrder (mocha). Run: npm test
const cds = require('@sap/cds')
const assert = require('assert')
const path = require('path')

const { POST, GET } = cds.test(path.join(__dirname, '..')) // boots CAP with in-memory SQLite + CSV seed data

const status = e => e.response?.status ?? e.status ?? e.code

describe('placeOrder', () => {
  const customer = { customerName: 'Test User', customerEmail: 'test@example.com' }
  const stockOf = async sku => (await GET(`/catalog/Products('${sku}')`)).data.stock

  it('creates an order and reduces stock', async () => {
    const before = await stockOf('LAP-1001')
    const { data } = await POST('/catalog/placeOrder', { ...customer, items: [{ sku: 'LAP-1001', quantity: 2 }] })
    assert.strictEqual(data.status, 'New')
    assert.strictEqual(Number(data.total), 1998)
    assert.strictEqual(await stockOf('LAP-1001'), before - 2)
  })

  it('rejects when stock is insufficient and rolls back everything', async () => {
    const before = await stockOf('TV-4002')
    await assert.rejects(
      POST('/catalog/placeOrder', { ...customer, items: [
        { sku: 'TV-4002', quantity: 1 }, { sku: 'ACC-7002', quantity: 1 } // ACC-7002 has stock 0
      ]}),
      e => status(e) === 409)
    assert.strictEqual(await stockOf('TV-4002'), before) // first line was rolled back
  })

  it('rejects unknown SKUs and bad input', async () => {
    await assert.rejects(POST('/catalog/placeOrder', { ...customer, items: [{ sku: 'NOPE', quantity: 1 }] }), e => status(e) === 404)
    await assert.rejects(POST('/catalog/placeOrder', { ...customer, items: [] }), e => status(e) === 400)
    await assert.rejects(POST('/catalog/placeOrder', { ...customer, customerEmail: 'bad', items: [{ sku: 'LAP-1001', quantity: 1 }] }), e => status(e) === 400)
  })
})
