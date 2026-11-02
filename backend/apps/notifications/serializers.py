from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'related_id', 'action_url', 'is_read', 'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'title', 'message', 'notification_type', 'related_id', 'action_url', 'created_at']

    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return f"{timesince(obj.created_at)} ago"
