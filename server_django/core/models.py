from django.db import models
from django.contrib.auth.models import AbstractUser

class Base(models.Model):
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        COMMANDER = 'BASE_COMMANDER', 'Base Commander'
        LOGISTICS = 'LOGISTICS_OFFICER', 'Logistics Officer'

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.LOGISTICS)
    base = models.ForeignKey(Base, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

class AssetType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Inventory(models.Model):
    base = models.ForeignKey(Base, on_delete=models.CASCADE, related_name='inventory')
    asset_type = models.ForeignKey(AssetType, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('base', 'asset_type')
        verbose_name_plural = "Inventories"

class Transaction(models.Model):
    class Type(models.TextChoices):
        PURCHASE = 'PURCHASE', 'Purchase'
        TRANSFER = 'TRANSFER', 'Transfer' 
        ASSIGNMENT = 'ASSIGNMENT', 'Assignment'
        EXPENDITURE = 'EXPENDITURE', 'Expenditure'

    type = models.CharField(max_length=50, choices=Type.choices)
    asset_type = models.ForeignKey(AssetType, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    
    # Logic fields
    from_base = models.ForeignKey(Base, on_delete=models.SET_NULL, null=True, blank=True, related_name='outgoing_transactions')
    to_base = models.ForeignKey(Base, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_transactions')
    recipient = models.CharField(max_length=255, blank=True, null=True) 
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.type} - {self.asset_type} ({self.quantity})"
