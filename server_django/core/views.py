from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.db.models import Sum, F
from .models import Base, AssetType, Transaction, Inventory, User
from .serializers import BaseSerializer, AssetTypeSerializer, TransactionSerializer, UserSerializer, InventorySerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdmin, IsCommander, IsLogistics
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"LOGIN ERROR: {error_details}") # Print to logs just in case
            return Response({"error": str(e), "trace": error_details}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Allow creating users with minimal logic for demo
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role', 'LOGISTICS_OFFICER')
        base_id = request.data.get('base')
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(username=username, password=password, role=role, base_id=base_id)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

class BaseViewSet(viewsets.ModelViewSet):
    queryset = Base.objects.all()
    serializer_class = BaseSerializer
    permission_classes = [IsAuthenticated]

class AssetTypeViewSet(viewsets.ModelViewSet):
    queryset = AssetType.objects.all()
    serializer_class = AssetTypeSerializer
    permission_classes = [IsAuthenticated]

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Transaction.objects.all().order_by('-date')
        if user.role == User.Role.ADMIN:
            return qs
        if user.role == User.Role.COMMANDER:
            return qs.filter(from_base=user.base) | qs.filter(to_base=user.base)
        if user.role == User.Role.LOGISTICS:
            # Logistics: Only base-related, AND only Purchase/Transfer
            base_qs = qs.filter(from_base=user.base) | qs.filter(to_base=user.base)
            return base_qs.filter(type__in=[Transaction.Type.PURCHASE, Transaction.Type.TRANSFER])
        return qs.none()

    def perform_create(self, serializer):
        from django.db import transaction as db_transaction
        # Core Logic: Validate & Update Inventory
        with db_transaction.atomic():
            tx = serializer.save(performed_by=self.request.user)
            self._update_inventory(tx)

    def _update_inventory(self, tx):
        # Update Inventory based on tx type
        # 1. Helper to update quantity
        def update_qty(base, asset_type, qty):
            inv, created = Inventory.objects.get_or_create(base=base, asset_type=asset_type)
            inv.quantity = F('quantity') + qty
            inv.save()
            inv.refresh_from_db()

        if tx.type == Transaction.Type.PURCHASE:
            if tx.to_base:
                update_qty(tx.to_base, tx.asset_type, tx.quantity)
                
        elif tx.type in [Transaction.Type.TRANSFER]:
            if tx.from_base and tx.to_base:
                update_qty(tx.from_base, tx.asset_type, -tx.quantity)
                update_qty(tx.to_base, tx.asset_type, tx.quantity)
                
        elif tx.type in [Transaction.Type.ASSIGNMENT, Transaction.Type.EXPENDITURE]:
            if tx.from_base:
                update_qty(tx.from_base, tx.asset_type, -tx.quantity)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Scope Inventory
        if user.role == User.Role.ADMIN:
            total_assets = Inventory.objects.aggregate(total=Sum('quantity'))['total'] or 0
        else:
            # Commanders/Logistics only see their base inventory
            total_assets = Inventory.objects.filter(base=user.base)\
                .aggregate(total=Sum('quantity'))['total'] or 0

        # 2. Scope Recent Transactions
        # Reuse logic from TransactionViewSet if possible, or duplicate for simplicity here
        qs = Transaction.objects.all().order_by('-date')
        if user.role == User.Role.ADMIN:
            recent_qs = qs
        elif user.role == User.Role.COMMANDER:
            recent_qs = qs.filter(from_base=user.base) | qs.filter(to_base=user.base)
        elif user.role == User.Role.LOGISTICS:
            base_qs = qs.filter(from_base=user.base) | qs.filter(to_base=user.base)
            recent_qs = base_qs.filter(type__in=[Transaction.Type.PURCHASE, Transaction.Type.TRANSFER])
        else:
            recent_qs = qs.none()

        recent_data = TransactionSerializer(recent_qs[:5], many=True).data
        
        return Response({
            "totalAssets": total_assets,
            "recentTransactions": recent_data
        })

from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Military Asset Manager API is running",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/v1/"
        }
    })
