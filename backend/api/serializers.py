from rest_framework import serializers
from .models import Item, ItemImage, Profile, WasteCollectionRequest, WasteType, STS, Van, DumpRequest, Notification, Area, WasteTransfer
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_role(self, value):
        request = self.context.get('request')
        if value and value != 'house_owner':
            is_admin = False
            if request and request.user and request.user.is_authenticated:
                if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
                    is_admin = True
                elif request.user.is_superuser or request.user.is_staff:
                    is_admin = True
            if not is_admin:
                raise serializers.ValidationError("Only admins can create users with roles other than 'house_owner'.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'house_owner')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user, role=role)
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


class WasteTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteType
        fields = '__all__'

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'

class WasteCollectionRequestSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    driver = serializers.ReadOnlyField(source='driver.username')
    waste_type_details = WasteTypeSerializer(source='waste_type', read_only=True)
    area_details = AreaSerializer(source='area', read_only=True)

    class Meta:
        model = WasteCollectionRequest
        fields = ['id', 'user', 'waste_type', 'waste_type_details', 'weight', 'description', 'latitude', 'longitude', 'area', 'area_details', 'driver', 'image', 'status', 'created_at', 'updated_at']
        read_only_fields = ['description', 'driver', 'status', 'created_at', 'updated_at']

class VanSimpleSerializer(serializers.ModelSerializer):
    driver_name = serializers.ReadOnlyField(source='driver.username')
    class Meta:
        model = Van
        fields = ['id', 'registration_number', 'capacity_kg', 'current_load_kg', 'status', 'trips_today', 'driver_name']

class STSSerializer(serializers.ModelSerializer):
    area_details = AreaSerializer(source='area', read_only=True)
    vans = VanSimpleSerializer(many=True, read_only=True)
    has_pending_requests = serializers.SerializerMethodField()

    class Meta:
        model = STS
        fields = '__all__'

    def get_has_pending_requests(self, obj):
        # Returns True if this STS has any active transfer requests to the landfill
        return obj.waste_transfers.filter(status='requested').exists()

class VanSerializer(serializers.ModelSerializer):
    sts_details = STSSerializer(source='sts', read_only=True)
    driver_name = serializers.ReadOnlyField(source='driver.username')

    class Meta:
        model = Van
        fields = '__all__'
        read_only_fields = ['current_load_kg', 'trips_today']

class DumpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DumpRequest
        fields = '__all__'
        read_only_fields = ['van', 'sts', 'declared_weight_kg', 'status', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class WasteTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteTransfer
        fields = '__all__'
        read_only_fields = ['status', 'created_at']
