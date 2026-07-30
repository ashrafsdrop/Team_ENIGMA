from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import the JWT views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import our views
from .views import ItemViewSet, ItemImageViewSet, AIAnalysisView, OCRAnalysisView

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'items', ItemViewSet, basename='item')
router.register(r'item-images', ItemImageViewSet, basename='item-image')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('analyze/', AIAnalysisView.as_view(), name='ai-analyze'),
    path('ocr/', OCRAnalysisView.as_view(), name='ocr-analyze'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
