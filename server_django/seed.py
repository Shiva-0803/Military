import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Base, AssetType, User, Inventory

def seed():
    print("Seeding Bases...")
    bases = [
        {"name": "Alpha Base", "location": "Sector 1", "created_at": "2024-01-01"},
        {"name": "Bravo Base", "location": "Sector 2", "created_at": "2024-01-01"},
    ]
    for b_data in bases:
        Base.objects.get_or_create(name=b_data["name"], defaults={"location": b_data["location"]})

    print("Seeding Asset Types...")
    assets = [
        {"name": "Rifle M4", "description": "Standard issue rifle"},
        {"name": "Night Vision Goggles", "description": "Gen 3 NVG"},
        {"name": "Tank M1", "description": "Main Battle Tank"},
    ]
    for a_data in assets:
        AssetType.objects.get_or_create(name=a_data["name"], defaults={"description": a_data["description"]})

    print("Seeding Users...")
    # Admin
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@army.mil", "admin123", role=User.Role.ADMIN)
    
    # Commander
    alpha = Base.objects.get(name="Alpha Base")
    if not User.objects.filter(username="commander").exists():
        User.objects.create_user("commander", "commander@army.mil", "commander123", role=User.Role.COMMANDER, base=alpha)

    # Logistics
    if not User.objects.filter(username="logistics").exists():
        User.objects.create_user("logistics", "logistics@army.mil", "logistics123", role=User.Role.LOGISTICS, base=alpha)

    print("Seeding Completed.")

if __name__ == "__main__":
    seed()
