from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, BaseViewSet, AssetTypeViewSet, TransactionViewSet, DashboardView, CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'bases', BaseViewSet)
router.register(r'assets', AssetTypeViewSet)
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/metrics/', DashboardView.as_view(), name='dashboard_metrics'),
    path('', include(router.urls)),
]
