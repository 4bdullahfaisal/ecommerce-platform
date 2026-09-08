from app.models import Product


def test_product_serializes_price_in_dollars():
    product = Product(id=7, name="Test", description="Description", price_cents=1250, category="Test", image_url="/test.jpg")
    assert product.to_dict()["price"] == 12.5
