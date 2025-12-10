from django.core.management.base import BaseCommand
from core.models import User
import os

class Command(BaseCommand):
    help = 'Creates a superuser/admin if none exists'

    def handle(self, *args, **kwargs):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, password=password, role='ADMIN')
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {username}'))
        else:
            # Fix existing admin if role is wrong
            u = User.objects.get(username=username)
            if u.role != 'ADMIN':
                u.role = 'ADMIN'
                u.is_superuser = True
                u.is_staff = True
                u.save()
                self.stdout.write(self.style.SUCCESS(f'Fixed role for existing admin: {username}'))
            else:
                self.stdout.write(self.style.WARNING(f'Admin user {username} already exists and is correct'))
