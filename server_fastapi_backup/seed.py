from app.database import SessionLocal, engine, Base
from app import models, dependencies
from sqlalchemy.exc import IntegrityError

db = SessionLocal()

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    print("Seeding Bases...")
    bases = [
        {"name": "Alpha Base", "location": "Sector 1"},
        {"name": "Bravo Base", "location": "Sector 2"}
    ]
    for b in bases:
        if not db.query(models.BaseObj).filter_by(name=b["name"]).first():
            db.add(models.BaseObj(**b))
    
    print("Seeding Asset Types...")
    asset_types = [
        {"name": "Rifle M4", "description": "Standard issue rifle"},
        {"name": "Night Vision Goggles", "description": "Gen 3 NVG"},
        {"name": "Tank M1", "description": "Main Battle Tank"}
    ]
    for a in asset_types:
        if not db.query(models.AssetType).filter_by(name=a["name"]).first():
            db.add(models.AssetType(**a))

    print("Seeding Users...")
    # Admin
    if not db.query(models.User).filter_by(username="admin").first():
        admin = models.User(
            username="admin",
            password=dependencies.get_password_hash("admin123"),
            role=models.Role.ADMIN
        )
        db.add(admin)
    
    # Commander
    base_alpha = db.query(models.BaseObj).filter_by(name="Alpha Base").first()
    if base_alpha and not db.query(models.User).filter_by(username="commander").first():
        commander = models.User(
            username="commander",
            password=dependencies.get_password_hash("commander123"),
            role=models.Role.BASE_COMMANDER,
            baseId=base_alpha.id
        )
        db.add(commander)

    try:
        db.commit()
        print("Seeding complete!")
    except IntegrityError as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
