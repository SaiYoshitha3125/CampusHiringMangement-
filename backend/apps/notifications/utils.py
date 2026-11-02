from apps.notifications.models import Notification


def send_notification(recipient, title, message, notification_type=Notification.NotificationType.SYSTEM, action_url='', related_id=''):
    """Helper utility to create in-app notifications reliably."""
    if not recipient:
        return None
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url,
        related_id=str(related_id)
    )
