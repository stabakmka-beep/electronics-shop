// Converts data/mock-data.xlsx (sheet "Products") to db/data/shop-Products.csv.
// CAP loads CSV files in db/data automatically on `cds watch` / `cds deploy`.
// Usage: npm run import [path/to/file.xlsx]
const ExcelJS = require('exceljs')
const fs = require('fs')
const path = require('path')

const SHEETS = {
  Products: { file: 'shop-Products.csv', required: ['sku', 'name', 'price'] }
}

const csvCell = v => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object' && v.text) v = v.text            // hyperlink cells
  if (typeof v === 'object' && v.result !== undefined) v = v.result // formula cells
  const s = String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  const input = process.argv[2] || path.join(__dirname, '..', 'data', 'mock-data.xlsx')
  const outDir = path.join(__dirname, '..', 'db', 'data')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(input)
  fs.mkdirSync(outDir, { recursive: true })

  for (const [sheetName, cfg] of Object.entries(SHEETS)) {
    const ws = wb.getWorksheet(sheetName)
    if (!ws) { console.warn(`Sheet "${sheetName}" not found – skipped`); continue }

    const headers = ws.getRow(1).values.slice(1).map(h => String(h ?? '').trim())
    const missing = cfg.required.filter(h => !headers.includes(h))
    if (missing.length) throw new Error(`Sheet "${sheetName}" is missing column(s): ${missing.join(', ')}`)

    const rows = []
    const seen = new Set()
    ws.eachRow((row, n) => {
      if (n === 1) return
      const vals = headers.map((_, i) => row.getCell(i + 1).value)
      if (vals.every(v => v === null || v === '')) return // blank row
      const rec = Object.fromEntries(headers.map((h, i) => [h, vals[i]]))
      for (const r of cfg.required)
        if (rec[r] === null || rec[r] === '') throw new Error(`${sheetName} row ${n}: "${r}" is empty`)
      if (seen.has(rec.sku)) throw new Error(`${sheetName} row ${n}: duplicate sku "${rec.sku}"`)
      seen.add(rec.sku)
      if (typeof rec.price !== 'number') throw new Error(`${sheetName} row ${n}: price must be a number`)
      if (rec.stock != null && rec.stock !== '' && !Number.isInteger(rec.stock))
        throw new Error(`${sheetName} row ${n}: stock must be a whole number`)
      rows.push(vals.map(csvCell).join(','))
    })

    fs.writeFileSync(path.join(outDir, cfg.file), [headers.join(','), ...rows].join('\n') + '\n')
    console.log(`${sheetName}: ${rows.length} rows -> db/data/${cfg.file}`)
  }
}

main().catch(e => { console.error('Import failed:', e.message); process.exit(1) })
