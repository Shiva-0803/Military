from rest_framework import serializers
from .models import User, Base, AssetType, Inventory, Transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'base']

class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Base
        fields = '__all__'

class AssetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetType
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    asset_type_name = serializers.CharField(source='asset_type.name', read_only=True)
    
    class Meta:
        model = Inventory
        fields = ['base', 'asset_type', 'asset_type_name', 'quantity']

class TransactionSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    asset_type_name = serializers.CharField(source='asset_type.name', read_only=True)
    from_base_name = serializers.CharField(source='from_base.name', read_only=True)
    to_base_name = serializers.CharField(source='to_base.name', read_only=True)

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['performed_by', 'date']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['performed_by'] = user
        return super().create(validated_data)

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra responses here
        data['user'] = UserSerializer(self.user).data
        # Also ensure 'token' is available if frontend expects it, or just use 'access'
        # data['token'] = data['access'] 
        return data
