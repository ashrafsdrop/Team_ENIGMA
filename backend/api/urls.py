from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import the JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import our views
from .views import ItemViewSet, ItemImageViewSet, AIAnalysisView, RegisterView, WasteCollectionRequestViewSet, WasteTypeViewSet, STSViewSet, VanViewSet, DumpRequestViewSet, NotificationViewSet, WasteTransferViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'item-images', ItemImageViewSet, basename='item-image')
router.register(r'waste-requests', WasteCollectionRequestViewSet, basename='waste-request')
router.register(r'waste-types', WasteTypeViewSet, basename='waste-type')
router.register(r'sts', STSViewSet, basename='sts')
router.register(r'vans', VanViewSet, basename='van')
router.register(r'dump-requests', DumpRequestViewSet, basename='dump-request')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'waste-transfers', WasteTransferViewSet, basename='waste-transfer')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('analyze/', AIAnalysisView.as_view(), name='ai-analyze'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
