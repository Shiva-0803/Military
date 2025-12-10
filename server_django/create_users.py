
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Base

def create_users():
    # 1. Get Base
    try:
        base = Base.objects.get(name="Fort Liberty (Bragg)")
    except Base.DoesNotExist:
        print("Base 'Fort Liberty (Bragg)' not found. Run populate_data.py first.")
        return

    users_data = [
        {
            "username": "commander_bragg",
            "password": "0803",
            "role": User.Role.COMMANDER,
            "base": base
        },
        {
            "username": "logistics_bragg",
            "password": "0803",
            "role": User.Role.LOGISTICS,
            "base": base
        }
    ]

    print(f"Creating users for base: {base.name}...")

    for data in users_data:
        try:
            user = User.objects.get(username=data['username'])
            print(f"  [.] User exists: {user.username}")
            # Optionally update info if needed, but skipping for now
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=data['username'],
                password=data['password'],
                role=data['role'],
                base=data['base']
            )
            print(f"  [+] Created User: {user.username} ({user.get_role_display()})")

if __name__ == '__main__':
    create_users()
