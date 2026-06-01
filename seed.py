import requests
import random
import time

BASE_URL = "http://localhost:8000"

print("Fetching products and customers...")
products_res = requests.get(f"{BASE_URL}/products/")
customers_res = requests.get(f"{BASE_URL}/customers/")

product_ids = [p['id'] for p in products_res.json()] if products_res.status_code == 200 else []
customer_ids = [c['id'] for c in customers_res.json()] if customers_res.status_code == 200 else []

print(f"Found {len(product_ids)} products and {len(customer_ids)} customers.")

# 3. Seed Orders (only if we got customers and products)
if customer_ids and product_ids:
    for i in range(5):
        # Pick random customer
        cid = random.choice(customer_ids)
        # Pick 1-3 random products
        num_items = random.randint(1, 3)
        selected_products = random.sample(product_ids, num_items)
        
        items = []
        for pid in selected_products:
            items.append({"product_id": pid, "quantity": random.randint(1, 2)})
            
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
