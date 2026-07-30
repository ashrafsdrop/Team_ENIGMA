from rest_framework import serializers
from .models import Item, ItemImage
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = '__all__'
        read_only_fields = ['created_at']

class ItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


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
