from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

products = [
 ("LAP-1001","UltraBook 14","14-inch lightweight laptop, 16 GB RAM, 512 GB SSD","Laptops",999.00,"USD",25,"https://example.com/img/lap-1001.jpg",True),
 ("LAP-1002","ProBook 16","16-inch performance laptop, 32 GB RAM, 1 TB SSD","Laptops",1499.00,"USD",12,"https://example.com/img/lap-1002.jpg",True),
 ("PHN-2001","Nova X Smartphone","6.5-inch OLED display, 128 GB storage, dual camera","Phones",599.00,"USD",60,"https://example.com/img/phn-2001.jpg",True),
 ("PHN-2002","Nova X Pro","6.7-inch OLED display, 256 GB storage, triple camera","Phones",849.00,"USD",35,"https://example.com/img/phn-2002.jpg",True),
 ("TAB-3001","Slate 10 Tablet","10-inch tablet, 64 GB storage, Wi-Fi","Tablets",329.00,"USD",40,"https://example.com/img/tab-3001.jpg",True),
 ("TV-4001","VisionView 55 4K TV","55-inch 4K smart TV with HDR","TVs",549.00,"USD",15,"https://example.com/img/tv-4001.jpg",True),
 ("TV-4002","VisionView 65 4K TV","65-inch 4K smart TV with HDR","TVs",799.00,"USD",8,"https://example.com/img/tv-4002.jpg",True),
 ("AUD-5001","BassBeat Headphones","Wireless over-ear headphones with noise cancelling","Audio",199.00,"USD",80,"https://example.com/img/aud-5001.jpg",True),
 ("AUD-5002","PocketPods","True wireless earbuds with charging case","Audio",79.00,"USD",150,"https://example.com/img/aud-5002.jpg",True),
 ("AUD-5003","SoundBar 300","Compact soundbar with wireless subwoofer","Audio",249.00,"USD",20,"https://example.com/img/aud-5003.jpg",True),
 ("WRB-6001","FitBand 5","Fitness tracker with heart-rate monitor","Wearables",59.00,"USD",100,"https://example.com/img/wrb-6001.jpg",True),
 ("WRB-6002","ChronoWatch S","Smartwatch with GPS and 5-day battery","Wearables",229.00,"USD",45,"https://example.com/img/wrb-6002.jpg",True),
 ("ACC-7001","FastCharge 65W","65 W USB-C wall charger","Accessories",39.00,"USD",200,"https://example.com/img/acc-7001.jpg",True),
 ("ACC-7002","PowerBank 20K","20,000 mAh portable power bank","Accessories",45.00,"USD",0,"https://example.com/img/acc-7002.jpg",True),
 ("CAM-8001","ActionCam 4K","Waterproof 4K action camera","Cameras",179.00,"USD",30,"https://example.com/img/cam-8001.jpg",True),
]
headers = ["sku","name","description","category","price","currency","stock","imageUrl","active"]

wb = Workbook()
ws = wb.active; ws.title = "Products"
F = "Arial"
hdr_fill = PatternFill("solid", fgColor="1F3864")
ws.append(headers)
for c in ws[1]:
    c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = hdr_fill
    c.alignment = Alignment(vertical="center")
for r in products: ws.append(list(r))
widths = [12,24,52,14,10,10,8,40,8]
for i,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(i)].width = w
for row in ws.iter_rows(min_row=2):
    for c in row:
        c.font = Font(name=F)
    row[4].number_format = "0.00"
ws.freeze_panes = "A2"

rd = wb.create_sheet("README", 0)
lines = [
 ("Electronics shop – product import template", True),
 ("", False),
 ("How to use", True),
 ("1. Edit the 'Products' sheet. Keep the header row exactly as it is (row 1).", False),
 ("2. Save this file as data/mock-data.xlsx in the project.", False),
 ("3. Run: npm run import   (creates db/data/shop-Products.csv)", False),
 ("4. Run: npm run watch    (CAP loads the CSV into the local database)", False),
 ("", False),
 ("Columns", True),
 ("sku – unique product code (required). Re-importing the same SKU updates it, it does not duplicate.", False),
 ("name, price – required. price is a number with a decimal point, e.g. 999.00", False),
 ("currency – 3-letter code. USD is a placeholder assumption; change it to your shop currency.", False),
 ("stock – whole number of units available.", False),
 ("imageUrl – link to an image (example.com links are placeholders). Do not paste pictures into cells.", False),
 ("active – TRUE shows the product in the shop, FALSE hides it.", False),
 ("", False),
 ("All 15 products are sample data made up for development.", False),
]
for i,(t,b) in enumerate(lines,1):
    c = rd.cell(row=i, column=1, value=t); c.font = Font(name=F, bold=b, size=14 if i==1 else 11)
rd.column_dimensions["A"].width = 110
wb.save("data/mock-data.xlsx")
print("saved")
