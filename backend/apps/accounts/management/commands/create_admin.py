import os
from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Securely create or update a Placement Administrator account.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@campushire.edu', help='Admin email address')
        parser.add_argument('--password', type=str, default=None, help='Admin password (or set via ADMIN_PASSWORD env var)')
        parser.add_argument('--first-name', type=str, default='Campus', help='Admin first name')
        parser.add_argument('--last-name', type=str, default='Director', help='Admin last name')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password'] or os.getenv('ADMIN_PASSWORD', 'AdminPass@CampusHire2026')
        first_name = options['first_name']
        last_name = options['last_name']

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )

        user.set_password(password)
        user.role = User.Role.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_verified = True
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"Successfully {action} Placement Administrator: {email}"))
