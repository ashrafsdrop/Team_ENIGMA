from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Item, ItemImage, WasteCollectionRequest, WasteType, STS, Van, DumpRequest, Notification, Truck, WasteTransfer
from .serializers import ItemSerializer, ItemImageSerializer, ItemImageUploadSerializer, AIRequestSerializer, RegisterSerializer, WasteCollectionRequestSerializer, WasteTypeSerializer, STSSerializer, VanSerializer, DumpRequestSerializer, NotificationSerializer, WasteTransferSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import base64
import json
import requests
import logging
import math
from .models import Area

logger = logging.getLogger(__name__)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ItemViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides the standard actions for the Item model.
    """
    # Optimized query to avoid N+1 problems if foreign keys (like owner) are added
    queryset = Item.objects.all() # Use Item.objects.select_related('owner').all() if owner is uncommented
    serializer_class = ItemSerializer
    # permission_classes = [permissions.IsAuthenticated] # Uncomment to require authentication


@extend_schema_view(
    create=extend_schema(request=ItemImageUploadSerializer, responses=ItemImageSerializer),
    update=extend_schema(request=ItemImageUploadSerializer, responses=ItemImageSerializer),
    partial_update=extend_schema(request=ItemImageUploadSerializer, responses=ItemImageSerializer),
)
class ItemImageViewSet(viewsets.ModelViewSet):
    queryset = ItemImage.objects.select_related('item').all()
    serializer_class = ItemImageSerializer
    parser_classes = (MultiPartParser, FormParser)

class AIAnalysisView(APIView):
    """
    Custom endpoint to handle AI processing.
    """
    @extend_schema(
        request=AIRequestSerializer,
        responses={200: dict} # Basic representation of response
    )
    def post(self, request, *args, **kwargs):
        # Validate data using our serializer
        serializer = AIRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt = serializer.validated_data.get('prompt')
        context = serializer.validated_data.get('context', '')

        try:
            # Prepare the request to Gemini API
            gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
            headers = {
                'Content-Type': 'application/json',
                'X-goog-api-key': settings.GEMINI_API_KEY
            }
            
            # Combine context and prompt if context exists
            full_prompt = f"Context: {context}\nPrompt: {prompt}" if context else prompt

            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": full_prompt
                            }
                        ]
                    }
                ]
            }

            # Make the API call
            response = requests.post(gemini_url, headers=headers, json=payload)
            response.raise_for_status() # Raise an exception for bad status codes
            
            response_data = response.json()
            
            # Extract the generated text from Gemini's response structure
            try:
                result = response_data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                result = "Could not parse response from Gemini."
                logger.error(f"Unexpected response structure: {response_data}")
            # Log the successful processing
            logger.info({
                "action": "ai_analysis",
                "status": "success",
                "prompt_length": len(prompt)
            })

            return Response({"success": True, "data": result}, status=status.HTTP_200_OK)

        except Exception as e:
            # Structured error logging
            logger.error({
                "action": "ai_analysis",
                "status": "error",
                "error_message": str(e)
            })
            return Response({"error": "An error occurred during AI processing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class WasteTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing waste types.
    """
    queryset = WasteType.objects.all()
    serializer_class = WasteTypeSerializer

@extend_schema_view(
    create=extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'waste_type': {'type': 'integer'},
                    'weight': {'type': 'number'},
                    'latitude': {'type': 'number'},
                    'longitude': {'type': 'number'},
                    'image': {'type': 'string', 'format': 'binary'}
                },
                'required': ['latitude', 'longitude']
            }
        },
        responses=WasteCollectionRequestSerializer
    ),
    update=extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'waste_type': {'type': 'integer'},
                    'weight': {'type': 'number'},
                    'latitude': {'type': 'number'},
                    'longitude': {'type': 'number'},
                    'image': {'type': 'string', 'format': 'binary'}
                }
            }
        },
        responses=WasteCollectionRequestSerializer
    ),
    partial_update=extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'waste_type': {'type': 'integer'},
                    'weight': {'type': 'number'},
                    'latitude': {'type': 'number'},
                    'longitude': {'type': 'number'},
                    'image': {'type': 'string', 'format': 'binary'}
                }
            }
        },
        responses=WasteCollectionRequestSerializer
    ),
)
class WasteCollectionRequestViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and creating waste collection requests.
    """
    queryset = WasteCollectionRequest.objects.all()
    serializer_class = WasteCollectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        waste_request = serializer.save(user=self.request.user)

        if waste_request.image:
            try:
                # Read image and convert to base64
                image_bytes = waste_request.image.read()
                image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                
                # Call Gemini
                gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
                headers = {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': settings.GEMINI_API_KEY
                }
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": 'Analyze this waste image. Return ONLY a JSON object with "type" (string, representing the category of waste like Plastic, Organic, Medical, E-Waste, etc.), "weight" (number in kg, estimating the weight of the visible waste), and "description" (a brief 1-2 sentence description of what the waste consists of). Example: {"type": "Plastic", "weight": 1.2, "description": "A pile of crushed water bottles."}. Do not include markdown formatting or backticks.'},
                                {
                                    "inline_data": {
                                        "mime_type": "image/jpeg",
                                        "data": image_b64
                                    }
                                }
                            ]
                        }
                    ]
                }
                
                response = requests.post(gemini_url, headers=headers, json=payload)
                response.raise_for_status()
                response_data = response.json()
                
                ai_text = response_data['candidates'][0]['content']['parts'][0]['text']
                # Clean up the markdown JSON if Gemini adds it
                ai_text = ai_text.strip().lstrip('```json').lstrip('```').rstrip('```').strip()
                ai_json = json.loads(ai_text)
                
                waste_type_name = ai_json.get("type", "Unknown")
                estimated_weight = float(ai_json.get("weight", 0.0))
                description = ai_json.get("description", "No description provided.")
                
                wt, _ = WasteType.objects.get_or_create(name=waste_type_name)
                waste_request.waste_type = wt
                waste_request.weight = estimated_weight
                waste_request.description = description
                
                # Auto-assign Area based on coordinates
                closest_area = None
                min_distance = float('inf')
                for area in Area.objects.all():
                    dist = haversine(waste_request.latitude, waste_request.longitude, area.latitude, area.longitude)
                    if dist <= area.radius_km and dist < min_distance:
                        min_distance = dist
                        closest_area = area
                
                waste_request.area = closest_area
                waste_request.save()
                
            except Exception as e:
                logger.error(f"Gemini analysis failed: {e}")
    
    def get_queryset(self):
        # Users can only see their own requests, unless they are admin/sts_manager etc.
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'sts_manager', 'area_head']):
            return WasteCollectionRequest.objects.all()
        if hasattr(user, 'profile') and user.profile.role == 'driver':
            # Drivers only see requests in their assigned STS area
            if hasattr(user, 'van') and user.van.sts.area:
                return WasteCollectionRequest.objects.filter(area=user.van.sts.area)
            return WasteCollectionRequest.objects.none()
        return WasteCollectionRequest.objects.filter(user=user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def accept(self, request, pk=None):
        waste_request = self.get_object()
        
        # Check if the user is a driver
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'driver':
            return Response({"error": "Only drivers can accept requests."}, status=status.HTTP_403_FORBIDDEN)
        
        if not hasattr(request.user, 'van'):
            return Response({"error": "You do not have a van assigned to you. Contact your STS manager."}, status=status.HTTP_400_BAD_REQUEST)

        van = request.user.van

        if van.trips_today >= van.max_trips_per_day:
            return Response({
                "error": f"Daily trip limit reached! Max trips allowed: {van.max_trips_per_day}, Completed today: {van.trips_today}."
            }, status=status.HTTP_400_BAD_REQUEST)

        if van.current_load_kg + waste_request.weight > van.capacity_kg:
            return Response({
                "error": f"Van capacity exceeded! Capacity: {van.capacity_kg}kg, Current Load: {van.current_load_kg}kg, Waste: {waste_request.weight}kg"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if waste_request.status != 'pending':
            return Response({"error": "This request is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update van load and status
        van.current_load_kg += waste_request.weight
        
        # If van is near capacity (e.g. > 90%), mark as returning, else collecting
        if van.current_load_kg >= (van.capacity_kg * 0.9):
            van.status = 'returning'
        else:
            van.status = 'collecting'
            
        van.save()
        
        # Assign driver and update status
        waste_request.driver = request.user
        waste_request.status = 'collected'
        waste_request.save()
        
        # Notify the house owner
        Notification.objects.create(
            user=waste_request.user,
            title="Waste Collection Accepted",
            message=f"Your waste collection request has been accepted by Van {van.registration_number}. The driver is on their way!"
        )
        
        serializer = self.get_serializer(waste_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign_van(self, request, pk=None):
        waste_request = self.get_object()
        
        # Check if caller is STS Manager
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'sts_manager':
            return Response({"error": "Only STS Managers can manually assign vans."}, status=status.HTTP_403_FORBIDDEN)
            
        van_id = request.data.get('van_id')
        if not van_id:
            return Response({"error": "van_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            van = Van.objects.get(id=van_id)
        except Van.DoesNotExist:
            return Response({"error": "Van not found."}, status=status.HTTP_404_NOT_FOUND)
            
        # Optional: check if van belongs to manager's STS. (Assuming manager has an STS relation, we could do this, but skipping strict check for hackathon speed unless needed).
            
        if van.trips_today >= van.max_trips_per_day:
            return Response({"error": "Van has reached its daily trip limit."}, status=status.HTTP_400_BAD_REQUEST)
            
        if van.current_load_kg + waste_request.weight > van.capacity_kg:
            return Response({"error": "Van capacity exceeded for this request."}, status=status.HTTP_400_BAD_REQUEST)
            
        if waste_request.status != 'pending':
            return Response({"error": "This request is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update van
        van.current_load_kg += waste_request.weight
        if van.current_load_kg >= (van.capacity_kg * 0.9):
            van.status = 'returning'
        else:
            van.status = 'collecting'
        van.save()
        
        # Assign driver and update request
        waste_request.driver = van.driver
        waste_request.status = 'collected'
        waste_request.save()
        
        # Notify house owner
        Notification.objects.create(
            user=waste_request.user,
            title="Waste Collection Scheduled",
            message=f"Your waste collection has been manually assigned to Van {van.registration_number} by the STS Manager."
        )
        
        # Notify driver
        if van.driver:
            Notification.objects.create(
                user=van.driver,
                title="New Collection Assigned",
                message=f"STS Manager assigned you a new pickup weighing {waste_request.weight}kg."
            )
            
        serializer = self.get_serializer(waste_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

class STSViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing STS and running AI predictions.
    """
    queryset = STS.objects.all()
    serializer_class = STSSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def predict_capacity(self, request, pk=None):
        sts = self.get_object()
        
        # Gather live data for prompt
        active_vans = sts.vans.count()
        vans_collecting = sts.vans.filter(status='collecting').count()
        vans_returning = sts.vans.filter(status='returning').count()
        
        pending_waste = WasteCollectionRequest.objects.filter(area=sts.area, status='pending')
        pending_weight_kg = sum(req.weight for req in pending_waste)
        
        prompt = f"""
        You are an intelligent logistics AI for a city waste management system. 
        Analyze the following Secondary Transfer Station (STS) data and predict when a truck needs to be dispatched.
        
        STS Name: {sts.name}
        Total Capacity: {sts.capacity_tonnes} tonnes
        Current Fill: {sts.current_fill_tonnes} tonnes
        Time since last collection: {sts.last_collected or 'Never'}
        
        Local Fleet Activity:
        Total Vans Assigned: {active_vans}
        Vans currently out collecting: {vans_collecting}
        Vans currently returning full of waste: {vans_returning}
        Total known pending waste waiting at houses in this area: {pending_weight_kg} kg
        
        Based on this live data, output a pure JSON object (no markdown formatting, no backticks, just the raw JSON string) with exactly these 4 keys:
        - "estimated_hours_until_full" (float, estimated hours based on current load and inbound vans)
        - "should_dispatch_truck_now" (boolean, true if they should request a truck immediately to prevent overflow)
        - "recommended_truck_tonnes" (float, how many tonnes they should request to clear space)
        - "reasoning" (string, a brief 1-sentence explanation of your decision)
        """
        
        try:
            import requests
            import json
            gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
            headers = {
                'Content-Type': 'application/json',
                'X-goog-api-key': settings.GEMINI_API_KEY
            }
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            
            response = requests.post(gemini_url, headers=headers, json=payload)
            response.raise_for_status()
            
            response_data = response.json()
            result_text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Clean up markdown if Gemini ignores instructions
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            prediction = json.loads(result_text)
            return Response(prediction, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Gemini Prediction Error: {e}")
            return Response({"error": "Failed to generate AI prediction."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VanViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing Vans and performing actions like dumping.
    """
    queryset = Van.objects.all()
    serializer_class = VanSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dump(self, request):
        if not hasattr(request.user, 'van'):
            return Response({"error": "You do not have a van assigned to you."}, status=status.HTTP_400_BAD_REQUEST)
        
        van = request.user.van
        if van.current_load_kg == 0:
            return Response({"error": "Your van is already empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        sts = van.sts
        
        # Create Dump Request
        dump_req = DumpRequest.objects.create(
            van=van,
            sts=sts,
            declared_weight_kg=van.current_load_kg,
            status='pending'
        )
        
        return Response({
            "message": f"Dump request submitted to {sts.name}. Please wait for STS Manager verification.",
            "dump_request_id": dump_req.id
        }, status=status.HTTP_201_CREATED)

class DumpRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing and verifying dump requests.
    """
    queryset = DumpRequest.objects.all()
    serializer_class = DumpRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request, pk=None):
        dump_req = self.get_object()
        
        # Ensure user is STS Manager
        if not hasattr(request.user, 'profile') or request.user.profile.role not in ['sts_manager', 'admin']:
            return Response({"error": "Only STS Managers can verify dump requests."}, status=status.HTTP_403_FORBIDDEN)
            
        if dump_req.status != 'pending':
            return Response({"error": "This request has already been verified."}, status=status.HTTP_400_BAD_REQUEST)
            
        actual_weight_kg = request.data.get('actual_weight_kg')
        if actual_weight_kg is None:
            return Response({"error": "You must provide the actual_weight_kg."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            actual_weight_kg = float(actual_weight_kg)
        except ValueError:
            return Response({"error": "actual_weight_kg must be a number."}, status=status.HTTP_400_BAD_REQUEST)
            
        sts = dump_req.sts
        van = dump_req.van
        load_tonnes = actual_weight_kg / 1000.0
        
        if sts.current_fill_tonnes + load_tonnes > sts.capacity_tonnes:
            return Response({
                "error": f"STS capacity exceeded! STS Capacity: {sts.capacity_tonnes}t, Current Fill: {sts.current_fill_tonnes}t, Attempted Dump: {load_tonnes}t"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Update Dump Request
        dump_req.actual_weight_kg = actual_weight_kg
        if abs(dump_req.declared_weight_kg - actual_weight_kg) > 5.0:  # 5kg tolerance
            dump_req.status = 'flagged'
        else:
            dump_req.status = 'verified'
        dump_req.save()
        
        # Transfer load based on ACTUAL weight
        sts.current_fill_tonnes += load_tonnes
        sts.save()
        
        # Empty van, reset status, and increment trips completed today
        van.current_load_kg = 0.0
        van.status = 'idle'
        van.trips_today += 1
        van.save()
        
        return Response({
            "message": f"Dump verified. Status: {dump_req.status}. Transferred {load_tonnes}t to STS. Van #{van.registration_number} trip #{van.trips_today} completed.",
            "status": dump_req.status
        }, status=status.HTTP_200_OK)

class NotificationViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and managing notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        count = notifications.update(is_read=True)
        return Response({"message": f"{count} notifications marked as read."}, status=status.HTTP_200_OK)

class WasteTransferViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing STS to Landfill transfers.
    """
    queryset = WasteTransfer.objects.all()
    serializer_class = WasteTransferSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign_truck(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != 'requested':
            return Response({"error": "Can only assign truck to a requested transfer."}, status=status.HTTP_400_BAD_REQUEST)
        
        truck_id = request.data.get('truck_id')
        if not truck_id:
            return Response({"error": "truck_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            truck = Truck.objects.get(id=truck_id)
        except Truck.DoesNotExist:
            return Response({"error": "Truck not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if truck.capacity_tonnes < transfer.requested_tonnes:
            return Response({"error": "Truck capacity is smaller than requested tonnes."}, status=status.HTTP_400_BAD_REQUEST)
            
        if truck.hours_driven_today >= 8.0:
            return Response({"error": "Truck has reached its 8 hour daily limit."}, status=status.HTTP_400_BAD_REQUEST)
            
        transfer.truck = truck
        transfer.status = 'truck_assigned'
        transfer.save()
        
        truck.status = 'moving'
        truck.save()
        return Response({"message": f"Truck {truck.registration_number} assigned."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dispatch_truck(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != 'truck_assigned':
            return Response({"error": "Can only dispatch an assigned transfer."}, status=status.HTTP_400_BAD_REQUEST)
            
        weight_leaving_sts = request.data.get('weight_leaving_sts')
        if not weight_leaving_sts:
            return Response({"error": "weight_leaving_sts is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        weight_leaving_sts = float(weight_leaving_sts)
        sts = transfer.sts
        
        # Subtract from STS fill
        sts.current_fill_tonnes -= weight_leaving_sts
        if sts.current_fill_tonnes < 0:
            sts.current_fill_tonnes = 0
        sts.last_collected = timezone.now()
        sts.save()
        
        transfer.weight_leaving_sts = weight_leaving_sts
        transfer.status = 'in_transit'
        transfer.departure_time = timezone.now()
        transfer.save()
        
        truck = transfer.truck
        truck.status = 'returning'
        truck.current_load_tonnes = weight_leaving_sts
        truck.save()
        
        return Response({"message": f"Truck dispatched with {weight_leaving_sts}t. STS fill is now {sts.current_fill_tonnes}t."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def receive_truck(self, request, pk=None):
        transfer = self.get_object()
        if transfer.status != 'in_transit':
            return Response({"error": "Can only receive an in_transit transfer."}, status=status.HTTP_400_BAD_REQUEST)
            
        weight_arriving_landfill = request.data.get('weight_arriving_landfill')
        if not weight_arriving_landfill:
            return Response({"error": "weight_arriving_landfill is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        weight_arriving_landfill = float(weight_arriving_landfill)
        transfer.weight_arriving_landfill = weight_arriving_landfill
        transfer.arrival_time = timezone.now()
        
        # Check discrepancy
        if abs(transfer.weight_leaving_sts - weight_arriving_landfill) > 0.5: # 500kg tolerance for big trucks
            transfer.status = 'flagged'
        else:
            transfer.status = 'received'
            
        transfer.save()
        
        # Assuming a flat 2 hours per trip for this hackathon
        truck = transfer.truck
        truck.hours_driven_today += 2.0 
        truck.status = 'idle'
        truck.current_load_tonnes = 0.0
        truck.save()
        
        return Response({"message": f"Truck received. Status: {transfer.status}."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def suggest_trucks(self, request, pk=None):
        transfer = self.get_object()
        sts = transfer.sts
        
        # 1. Fetch all trucks
        all_trucks = Truck.objects.all()
        suggestions = []
        
        for truck in all_trucks:
            # 2. Check if truck can carry the requested weight
            if truck.capacity_tonnes < transfer.requested_tonnes:
                continue
                
            # 3. Check driving hours (assume this trip takes 2 hours)
            if truck.hours_driven_today + 2.0 > 8.0:
                continue
                
            # 4. Calculate Distance from Landfill to STS (Haversine)
            # using the existing haversine function from views.py
            distance_km = haversine(sts.latitude, sts.longitude, truck.landfill.latitude, truck.landfill.longitude)
            
            # 5. Calculate Fuel Cost
            # Empty trip to STS
            fuel_empty = distance_km * truck.base_fuel_cost_per_km
            # Loaded trip back
            fuel_loaded = distance_km * (truck.base_fuel_cost_per_km + (truck.load_fuel_penalty * transfer.requested_tonnes))
            total_fuel = fuel_empty + fuel_loaded
            
            suggestions.append({
                "truck_id": truck.id,
                "registration_number": truck.registration_number,
                "capacity_tonnes": truck.capacity_tonnes,
                "status": truck.status,
                "hours_driven_today": truck.hours_driven_today,
                "distance_km": round(distance_km, 2),
                "estimated_fuel_liters": round(total_fuel, 2)
            })
            
        # Sort by fuel efficiency (lowest fuel first)
        suggestions.sort(key=lambda x: x['estimated_fuel_liters'])
        
        return Response(suggestions, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_mission(self, request):
        user = request.user
        if not hasattr(user, 'profile') or user.profile.role != 'truck_owner':
            return Response({"error": "Only truck drivers can fetch missions."}, status=status.HTTP_403_FORBIDDEN)
            
        if not hasattr(user, 'truck'):
            return Response({"error": "No truck assigned to your profile."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get active transfer for this truck
        active_transfer = WasteTransfer.objects.filter(
            truck=user.truck, 
            status__in=['truck_assigned', 'in_transit']
        ).first()
        
        if not active_transfer:
            return Response({"message": "No active mission right now.", "mission": None}, status=status.HTTP_200_OK)
            
        distance_km = haversine(
            active_transfer.sts.latitude, 
            active_transfer.sts.longitude, 
            active_transfer.truck.landfill.latitude, 
            active_transfer.truck.landfill.longitude
        )
            
        serializer = self.get_serializer(active_transfer)
        data = serializer.data
        data['distance_km'] = round(distance_km, 2)
        
        return Response({"mission": data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def arrived_at_sts(self, request, pk=None):
        transfer = self.get_object()
        
        if transfer.status != 'truck_assigned':
            return Response({"error": "Transfer must be in truck_assigned state."}, status=status.HTTP_400_BAD_REQUEST)
            
        truck = transfer.truck
        if not truck:
            return Response({"error": "No truck assigned to this transfer."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update truck status
        truck.status = 'loading'
        truck.save()
        
        # Notify STS Manager
        sts_manager = transfer.sts.manager
        if sts_manager:
            Notification.objects.create(
                user=sts_manager,
                title="Heavy Truck Arrived",
                message=f"Truck {truck.registration_number} has arrived at the gate for Transfer #{transfer.id}. Ready for loading and dispatch."
            )
            
        return Response({"message": "Arrived at STS successfully. Status updated to loading."}, status=status.HTTP_200_OK)

