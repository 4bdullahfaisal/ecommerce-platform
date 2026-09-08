import pytest

from app.app import create_app
from app.models import db


@pytest.fixture
def client():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.test_client() as client:
        yield client
    with app.app_context():
        db.drop_all()


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}


def test_products_are_seeded(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    assert len(response.json) == 4


def test_order_requires_valid_items(client, monkeypatch):
    monkeypatch.setattr("app.app.send_order_confirmation.delay", lambda order_id: None)
    response = client.post("/api/orders", json={"email": "buyer@example.com", "items": [{"productId": 1, "quantity": 2}]})
    assert response.status_code == 201
    assert response.json["total"] == 178.0
