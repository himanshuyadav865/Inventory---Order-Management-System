import requests
import random
import time

BASE_URL = "http://localhost:8000"

print("Seeding database...")

# 1. Seed Products
products = [
    {"name": "Wireless Mouse", "sku": "WM-001", "description": "Ergonomic wireless mouse", "price": 25.99, "stock_quantity": 150},
    {"name": "Mechanical Keyboard", "sku": "MK-002", "description": "RGB mechanical keyboard with blue switches", "price": 89.99, "stock_quantity": 45},
    {"name": "27-inch Monitor", "sku": "MON-003", "description": "4K UHD IPS Monitor", "price": 350.00, "stock_quantity": 12},
    {"name": "USB-C Hub", "sku": "USB-004", "description": "7-in-1 USB-C Hub with HDMI", "price": 35.50, "stock_quantity": 200},
    {"name": "Noise Cancelling Headphones", "sku": "HP-005", "description": "Over-ear active noise cancelling headphones", "price": 199.99, "stock_quantity": 8},
    {"name": "Smartphone Stand", "sku": "ST-006", "description": "Adjustable aluminum smartphone stand", "price": 15.00, "stock_quantity": 300},
    {"name": "Laptop Cooling Pad", "sku": "CP-007", "description": "Cooling pad with 3 silent fans", "price": 45.00, "stock_quantity": 85},
    {"name": "Webcam 1080p", "sku": "CAM-008", "description": "HD 1080p webcam with built-in microphone", "price": 60.00, "stock_quantity": 110},
    {"name": "Ergonomic Chair", "sku": "CHR-009", "description": "Office chair with lumbar support", "price": 250.00, "stock_quantity": 25},
    {"name": "Desk Lamp", "sku": "LMP-010", "description": "LED desk lamp with adjustable brightness", "price": 22.50, "stock_quantity": 150}
]

product_ids = []
for p in products:
    res = requests.post(f"{BASE_URL}/products/", json=p)
    if res.status_code == 201:
        print(f"Created product: {p['name']}")
        product_ids.append(res.json()['id'])
    elif res.status_code == 400:
        print(f"Product {p['name']} already exists.")
        # If it exists, let's try to get its ID anyway to use for orders
    else:
        print(f"Failed to create product {p['name']}: {res.text}")

# Always fetch all products to make sure we have IDs for orders
products_res = requests.get(f"{BASE_URL}/products/")
product_ids = [p['id'] for p in products_res.json()] if products_res.status_code == 200 else []

# 2. Seed Customers
customers = [
    {"full_name": "Aarav Sharma", "email": "aarav.sharma@example.in", "phone": "9876543210"},
    {"full_name": "Priya Patel", "email": "priya.patel@example.in", "phone": "9876543211"},
    {"full_name": "Rohan Gupta", "email": "rohan.gupta@example.in", "phone": "9876543212"},
    {"full_name": "Ananya Singh", "email": "ananya.singh@example.in", "phone": "9876543213"},
    {"full_name": "Vikram Verma", "email": "vikram.verma@example.in", "phone": "9876543214"},
    {"full_name": "Neha Reddy", "email": "neha.reddy@example.in", "phone": "9876543215"},
]

customer_ids = []
for c in customers:
    res = requests.post(f"{BASE_URL}/customers/", json=c)
    if res.status_code == 201:
        print(f"Created customer: {c['full_name']}")
    elif res.status_code == 400:
        print(f"Customer {c['full_name']} already exists.")
    else:
        print(f"Failed to create customer {c['full_name']}: {res.text}")

customers_res = requests.get(f"{BASE_URL}/customers/")
customer_ids = [c['id'] for c in customers_res.json()] if customers_res.status_code == 200 else []

# 3. Seed Orders
print(f"Found {len(product_ids)} products and {len(customer_ids)} customers.")
if customer_ids and product_ids:
    for i in range(8):
        cid = random.choice(customer_ids)
        num_items = random.randint(1, 4)
        selected_products = random.sample(product_ids, num_items)
        
        items = []
        for pid in selected_products:
            items.append({"product_id": pid, "quantity": random.randint(1, 3)})
            
        order_payload = {
            "customer_id": cid,
            "status": "pending",
            "items": items
        }
        
        res = requests.post(f"{BASE_URL}/orders/", json=order_payload)
        if res.status_code == 201:
            print(f"Created order for customer {cid} with {num_items} items.")
        else:
            print(f"Failed to create order: {res.text}")

print("Seeding complete!")
