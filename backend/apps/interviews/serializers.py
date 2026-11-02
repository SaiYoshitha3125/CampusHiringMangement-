from rest_framework import serializers
from django.utils import timezone
from apps.interviews.models import Interview
from apps.applications.models import JobApplication
from apps.notifications.utils import send_notification
from apps.notifications.models import Notification


class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='application.student.user.full_name', read_only=True)
    candidate_email = serializers.CharField(source='application.student.user.email', read_only=True)
    candidate_phone = serializers.CharField(source='application.student.user.phone', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    is_upcoming = serializers.ReadOnlyField()

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'candidate_name', 'candidate_email',
            'candidate_phone', 'company_name', 'job_title',
            'round_number', 'round_name', 'mode', 'meeting_link',
            'venue', 'scheduled_at', 'duration_minutes', 'interviewer_names',
            'instructions', 'status', 'feedback', 'rating', 'is_upcoming',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_upcoming']


class InterviewCreateSerializer(serializers.ModelSerializer):
    application_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'application_id', 'round_number', 'round_name', 'mode',
            'meeting_link', 'venue', 'scheduled_at', 'duration_minutes',
            'interviewer_names', 'instructions'
        ]
        read_only_fields = ['id']

    def validate_scheduled_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Interview must be scheduled for a future date and time.")
        return value

    def validate(self, attrs):
        application_id = attrs.get('application_id')
        user = self.context['request'].user

        try:
            app = JobApplication.objects.select_related('job__company', 'student__user').get(pk=application_id)
        except JobApplication.DoesNotExist:
            raise serializers.ValidationError({'application_id': 'Job application not found.'})

        # Recruiter ownership check
        if user.role == 'RECRUITER':
            if app.job.company != user.recruiter_profile.company:
                raise serializers.ValidationError({'application_id': 'You do not have permission to schedule interviews for this applicant.'})

        attrs['application'] = app
        return attrs

    def create(self, validated_data):
        app = validated_data.pop('application')
        validated_data.pop('application_id', None)
        interview = Interview.objects.create(application=app, **validated_data)

        # Transition application status to INTERVIEW_SCHEDULED
        app.transition_status(
            JobApplication.Status.INTERVIEW_SCHEDULED,
            changed_by=self.context['request'].user,
            remarks=f"Interview scheduled for {interview.round_name} on {interview.scheduled_at.strftime('%Y-%m-%d %H:%M UTC')}."
        )

        # Send notification to student
        mode_info = f"Meeting Link: {interview.meeting_link}" if interview.mode == 'ONLINE' else f"Venue: {interview.venue}"
        send_notification(
            recipient=app.student.user,
            title=f"Interview Scheduled: {interview.round_name}",
            message=f"You have an upcoming interview for '{app.job.title}' with {app.job.company.name} on {interview.scheduled_at.strftime('%Y-%m-%d %H:%M UTC')}. {mode_info}",
            notification_type=Notification.NotificationType.INTERVIEW_SCHEDULED,
            action_url="/student/interviews"
        )

        return interview
