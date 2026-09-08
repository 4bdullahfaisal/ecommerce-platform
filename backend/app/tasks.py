import os

from celery import Celery


def create_celery(app):
    celery = Celery(app.import_name, broker=app.config["CELERY_BROKER_URL"])
    celery.conf.update(result_backend=app.config["CELERY_RESULT_BACKEND"])
    return celery


redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery = Celery("ecommerce", broker=redis_url, backend=redis_url)


@celery.task
def send_order_confirmation(order_id):
    return {"order_id": order_id, "sent": True}
