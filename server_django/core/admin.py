from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Base, AssetType, Inventory, Transaction

# Define a custom UserAdmin to handle the extra fields (role, base)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Military Profile', {'fields': ('role', 'base')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Military Profile', {'fields': ('role', 'base')}),
    )
    list_display = UserAdmin.list_display + ('role', 'base')
    list_filter = UserAdmin.list_filter + ('role', 'base')

# Register the models
admin.site.register(User, CustomUserAdmin)
admin.site.register(Base)
admin.site.register(AssetType)
admin.site.register(Inventory)
admin.site.register(Transaction)
