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

        # 3. Seed Inventory & Transactions
        self.stdout.write('Seeding Inventory & History...')
        from core.models import Transaction, User
        
        # Create a dummy system user for audit if needed, or just leave null
        # user, _ = User.objects.get_or_create(username='admin', defaults={'role': 'ADMIN'})

        for base in created_bases:
            for asset in created_assets:
                # Random quantity between 10 and 500
                qty = random.randint(10, 500)
                
                if 'Siachen' in base.name and 'Winter' in asset.name:
                    qty = random.randint(1000, 5000)
                
                if 'Tank' in asset.name and ('Western' in base.name or 'Jaipur' in base.location):
                    qty = random.randint(50, 100)

                # Create Inventory
                Inventory.objects.get_or_create(
                    base=base,
                    asset_type=asset,
                    defaults={'quantity': qty}
                )

                # Create 'Purchase' History (to explain this inventory)
                # We assume 120% was purchased, and 20% might be expended/transferred
                purchase_qty = int(qty * 1.2) 
                Transaction.objects.get_or_create(
                    type=Transaction.Type.PURCHASE,
                    asset_type=asset,
                    to_base=base,
                    quantity=purchase_qty,
                    defaults={'recipient': 'Central Supply'}
                )

                # Create 'Expenditure' (some usage)
                expend_qty = int(qty * 0.1)
                if expend_qty > 0:
                    Transaction.objects.create(
                        type=Transaction.Type.EXPENDITURE,
                        asset_type=asset,
                        from_base=base,
                        quantity=expend_qty,
                        recipient='Training Exercise'
                    )
                
                # Random Transfers (between bases)
                if random.random() > 0.7:
                    other_base = random.choice([b for b in created_bases if b != base])
                    transfer_qty = int(qty * 0.05)
                    if transfer_qty > 0:
                         Transaction.objects.create(
                            type=Transaction.Type.TRANSFER,
                            asset_type=asset,
                            from_base=base,
                            to_base=other_base,
                            quantity=transfer_qty,
                            recipient='Logistics Move'
                        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Indian Military Data!'))
