from rest_framework import serializers
from .models import Item, ItemImage

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = '__all__'
        read_only_fields = ['created_at']


class ItemImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = '__all__'
        read_only_fields = ['created_at']

class AIRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(max_length=500)
    context = serializers.CharField(required=False, allow_blank=True)

class OCRRequestSerializer(serializers.Serializer):
    image = serializers.FileField()
    prompt = serializers.CharField(max_length=500, required=False, default="Analyze and summarize the text found in this image.")
