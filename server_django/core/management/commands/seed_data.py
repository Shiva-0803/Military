from django.core.management.base import BaseCommand
from core.models import Base, AssetType, Inventory
import random

class Command(BaseCommand):
    help = 'Seeds database with Indian Military Bases and Assets'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding Indian Military Data...')

        # 1. Define Bases
        bases_data = [
            {'name': 'Northern Command HQ', 'location': 'Udhampur, J&K'},
            {'name': 'Western Command HQ', 'location': 'Chandimandir, Haryana'},
            {'name': 'Southern Command HQ', 'location': 'Pune, Maharashtra'},
            {'name': 'Eastern Command HQ', 'location': 'Kolkata, West Bengal'},
            {'name': 'South Western Command HQ', 'location': 'Jaipur, Rajasthan'},
            {'name': 'Siachen Base Camp', 'location': 'Ladakh (High Altitude)'},
            {'name': 'Pathankot Air Force Station', 'location': 'Pathankot, Punjab'},
            {'name': 'INS Kadamba (Naval Base)', 'location': 'Karwar, Karnataka'},
        ]

        created_bases = []
        for b_data in bases_data:
            base, created = Base.objects.get_or_create(
                name=b_data['name'], 
                defaults={'location': b_data['location']}
            )
            created_bases.append(base)
            if created:
                self.stdout.write(f"Created Base: {base.name}")

        # 2. Define Assets
        assets_data = [
            {'name': 'T-90 Bhishma Tank', 'description': 'Main Battle Tank'},
            {'name': 'INSAS Rifle (5.56mm)', 'description': 'Standard Infantry Weapon'},
            {'name': 'HAL Dhruv Helicopter', 'description': 'Utility Helicopter'},
            {'name': 'BrahMos Missile System', 'description': 'Supersonic Cruise Missile'},
            {'name': 'High Altitude Ration (MRE)', 'description': 'Specialized Food Supplies'},
            {'name': 'Siachen Winter Gear', 'description': 'Extreme Cold Weather Clothing'},
            {'name': 'Ashok Leyland Stallion', 'description': 'Logistics Truck'},
        ]

        created_assets = []
        for a_data in assets_data:
            asset, created = AssetType.objects.get_or_create(
                name=a_data['name'],
                defaults={'description': a_data['description']}
            )
            created_assets.append(asset)
            if created:
                self.stdout.write(f"Created Asset: {asset.name}")

        # 3. Seed Inventory (Randomized)
        self.stdout.write('Seeding Inventory...')
        for base in created_bases:
            for asset in created_assets:
                # Random quantity between 0 and 500
                qty = random.randint(10, 500)
                
                # Logic: More winter gear in Siachen
                if 'Siachen' in base.name and 'Winter' in asset.name:
                    qty = random.randint(1000, 5000)
                
                # Logic: More tanks in Western/South Western (Plains)
                if 'Tank' in asset.name and ('Western' in base.name or 'Jaipur' in base.location):
                    qty = random.randint(50, 100)

                obj, created = Inventory.objects.get_or_create(
                    base=base,
                    asset_type=asset,
                    defaults={'quantity': qty}
                )
                if not created:
                    # Update quantity if exists just to vary it slightly on re-runs (optional, skipping for stability)
                    pass

        self.stdout.write(self.style.SUCCESS('Successfully seeded Indian Military Data!'))
