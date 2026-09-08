import os
import smtplib
from email.message import EmailMessage

from celery import Celery


def create_celery(app):
    celery = Celery(app.import_name, broker=app.config["CELERY_BROKER_URL"])
    celery.conf.update(result_backend=app.config["CELERY_RESULT_BACKEND"])
    return celery


redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery = Celery("ecommerce", broker=redis_url, backend=redis_url)


@celery.task
def send_order_confirmation(order_id, recipient, total):
    smtp_host = os.getenv("SMTP_HOST")
    if not smtp_host:
        print(f"Order confirmation queued for {recipient} (order {order_id}, total ${total:.2f}); SMTP is not configured.")
        return {"order_id": order_id, "sent": False, "reason": "smtp_not_configured"}

    message = EmailMessage()
    message["Subject"] = f"Your Common Ground order #{order_id}"
    message["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USERNAME", "orders@example.com"))
    message["To"] = recipient
    message.set_content(f"Thank you for your order. Your order number is #{order_id}.\nTotal: ${total:.2f}")

    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(os.getenv("SMTP_USERNAME", ""), os.getenv("SMTP_PASSWORD", ""))
        server.send_message(message)
    return {"order_id": order_id, "sent": True}
