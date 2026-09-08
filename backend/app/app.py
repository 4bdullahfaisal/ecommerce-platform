import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics

from app.models import Order, Product, db
from app.tasks import send_order_confirmation
from app.utils import seed_products


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///ecommerce.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        CELERY_BROKER_URL=os.getenv("REDIS_URL", "redis://redis:6379/0"),
        CELERY_RESULT_BACKEND=os.getenv("REDIS_URL", "redis://redis:6379/0"),
    )
    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})
    PrometheusMetrics(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_products(db)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/api/products")
    def products():
        category = request.args.get("category")
        query = Product.query
        if category:
            query = query.filter_by(category=category)
        return jsonify([product.to_dict() for product in query.order_by(Product.created_at.desc()).all()])

    @app.get("/api/products/<int:product_id>")
    def product(product_id):
        item = db.get_or_404(Product, product_id)
        return jsonify(item.to_dict())

    @app.post("/api/orders")
    def create_order():
        payload = request.get_json(silent=True) or {}
        email = payload.get("email", "").strip()
        items = payload.get("items", [])
        if not email or "@" not in email or not items:
            return jsonify({"error": "A valid email and at least one item are required"}), 400

        total_cents = 0
        for item in items:
            product = db.session.get(Product, item.get("productId"))
            quantity = int(item.get("quantity", 0))
            if not product or quantity < 1:
                return jsonify({"error": "Order contains an invalid item"}), 400
            total_cents += product.price_cents * quantity

        order = Order(email=email, total_cents=total_cents)
        db.session.add(order)
        db.session.commit()
        send_order_confirmation.delay(order.id, order.email, order.total_cents / 100)
        result = order.to_dict()
        result["confirmation"] = "queued"
        return jsonify(result), 201

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
