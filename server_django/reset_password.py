
from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()
username = 'admin'
password = 'admin'

try:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f"Password for user '{username}' has been reset to '{password}'.")
except User.DoesNotExist:
    print(f"User '{username}' does not exist. Creating now...")
    User.objects.create_superuser(username=username, password=password)
    print(f"Superuser '{username}' created with password '{password}'.")
except Exception as e:
    print(f"An error occurred: {e}")
