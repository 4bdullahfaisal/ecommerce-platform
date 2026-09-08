from app.models import Product


SEED_PRODUCTS = [
    {
        "name": "Arc Desk Lamp",
        "description": "A warm, adjustable light for focused evenings.",
        "price_cents": 8900,
        "category": "Lighting",
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Linen Lounge Chair",
        "description": "Soft texture and a generous silhouette for slow mornings.",
        "price_cents": 24900,
        "category": "Furniture",
        "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Ceramic Pour-Over",
        "description": "Hand-finished stoneware for a calmer daily ritual.",
        "price_cents": 4200,
        "category": "Kitchen",
        "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Oak Catchall Tray",
        "description": "A simple landing place for keys, watches, and small essentials.",
        "price_cents": 3600,
        "category": "Objects",
        "image_url": "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=85",
    },
]


def seed_products(db):
    if Product.query.count() == 0:
        db.session.bulk_insert_mappings(Product, SEED_PRODUCTS)
        db.session.commit()
