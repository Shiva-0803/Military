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

class PublicUserListView(generics.ListAPIView):
    queryset = User.objects.filter(is_active=True).order_by('role') # Sort for consistency
    from .serializers import PublicUserSerializer
    serializer_class = PublicUserSerializer
    permission_classes = [AllowAny]

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
        
        # 1. Closing Balance (Current Inventory)
        inv_qs = Inventory.objects.all()
        if user.role != User.Role.ADMIN and user.base:
            inv_qs = inv_qs.filter(base=user.base)
        
        closing_balance = inv_qs.aggregate(total=Sum('quantity'))['total'] or 0

        # 2. Transactions for flow calculation
        tx_qs = Transaction.objects.all()
        
        # Filter QS based on role
        if user.role == User.Role.ADMIN:
            relevant_tx = tx_qs
        elif user.base:
            # For Base users, we care about transactions involving their base
            relevant_tx = tx_qs.filter(from_base=user.base) | tx_qs.filter(to_base=user.base)
        else:
            relevant_tx = tx_qs.none()

        # Calculate flows
        # Purchases (Always Incoming)
        purchases = relevant_tx.filter(
            type=Transaction.Type.PURCHASE
        ).aggregate(total=Sum('quantity'))['total'] or 0

        # Expended (Always Outgoing)
        expended = relevant_tx.filter(
            type=Transaction.Type.EXPENDITURE
        ).aggregate(total=Sum('quantity'))['total'] or 0

        # Transfers
        if user.role == User.Role.ADMIN:
            # For Admin, Transfers are internal movements, so net effect on "Total System Assets" is 0?
            # Or should we count total volume moved?
            # Let's assume Admin sees "System Total". Transfers don't change System Total.
            # Purchases add to System. Expenditures remove from System.
            transfer_in = 0
            transfer_out = 0
            net_movement = purchases - expended # Admin Net Movement
        else:
            # Base View
            # Transfer In: To this base
            transfer_in = relevant_tx.filter(
                type=Transaction.Type.TRANSFER, 
                to_base=user.base
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            # Transfer Out: From this base
            transfer_out = relevant_tx.filter(
                type=Transaction.Type.TRANSFER, 
                from_base=user.base
            ).aggregate(total=Sum('quantity'))['total'] or 0

            # Net Movement (Balance Change excl Expenditure? Frontend logic seemed to exclude Expended from Net Movement popup)
            # Frontend Logic: Net Movement = Purchases + Transfer In - Transfer Out.
            # So we stick to that for the "Net Movement" card.
            net_movement = purchases + transfer_in - transfer_out

        # Opening Balance Calculation
        # Closing = Opening + (Purchases + TransferIn - TransferOut) - Expended
        # Closing = Opening + NetMovement - Expended
        # Opening = Closing - NetMovement + Expended
        opening_balance = closing_balance - net_movement + expended

        # Recent Transactions List
        recent_data = TransactionSerializer(relevant_tx.order_by('-date')[:5], many=True).data
        
        return Response({
            "metrics": {
                "openingBalance": opening_balance,
                "netMovement": net_movement,
                "closingBalance": closing_balance,
                "expended": expended,
                "purchases": purchases,
                "transferIn": transfer_in,
                "transferOut": transfer_out
            },
            "transactions": recent_data
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
