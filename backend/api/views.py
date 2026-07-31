from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Item, ItemImage, WasteCollectionRequest, WasteType, STS, Van, DumpRequest
from .serializers import ItemSerializer, ItemImageSerializer, ItemImageUploadSerializer, AIRequestSerializer, RegisterSerializer, WasteCollectionRequestSerializer, WasteTypeSerializer, STSSerializer, VanSerializer, DumpRequestSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import base64
import json
import requests
import logging

logger = logging.getLogger(__name__)


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
                waste_request.save()
                
            except Exception as e:
                logger.error(f"Gemini analysis failed: {e}")
    
    def get_queryset(self):
        # Users can only see their own requests, unless they are admin/sts_manager etc.
        user = self.request.user
        if user.is_staff or (hasattr(user, 'profile') and user.profile.role in ['admin', 'sts_manager', 'area_head', 'driver']):
            return WasteCollectionRequest.objects.all()
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
        
        # Update van load
        van.current_load_kg += waste_request.weight
        van.save()
        
        # Assign driver and update status
        waste_request.driver = request.user
        waste_request.status = 'collected'
        waste_request.save()
        
        serializer = self.get_serializer(waste_request)
        return Response(serializer.data, status=status.HTTP_200_OK)

class STSViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing STS.
    """
    queryset = STS.objects.all()
    serializer_class = STSSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        
        # Empty van and increment trips completed today
        van.current_load_kg = 0.0
        van.trips_today += 1
        van.save()
        
        return Response({
            "message": f"Dump verified. Status: {dump_req.status}. Transferred {load_tonnes}t to STS. Van #{van.registration_number} trip #{van.trips_today} completed.",
            "status": dump_req.status
        }, status=status.HTTP_200_OK)

