from celery import Celery


def create_celery(app):
    celery = Celery(app.import_name, broker=app.config["CELERY_BROKER_URL"])
    celery.conf.update(result_backend=app.config["CELERY_RESULT_BACKEND"])
    return celery


celery = Celery("ecommerce")


@celery.task
def send_order_confirmation(order_id):
    return {"order_id": order_id, "sent": True}
