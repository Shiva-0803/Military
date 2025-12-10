from django.contrib import admin
from django.urls import path, include
from core.views import api_root

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('core.urls')),
    path('', api_root),
]
