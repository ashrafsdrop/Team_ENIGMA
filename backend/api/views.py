from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Item, ItemImage
from .serializers import ItemSerializer, ItemImageSerializer, ItemImageUploadSerializer, AIRequestSerializer, OCRRequestSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from PIL import Image
import pytesseract
import requests
import logging

logger = logging.getLogger(__name__)


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

class OCRAnalysisView(APIView):
    """
    Custom endpoint for Image OCR + AI Analysis.
    """
    parser_classes = (MultiPartParser, FormParser)

    @extend_schema(
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'image': {'type': 'string', 'format': 'binary'},
                    'prompt': {'type': 'string', 'default': 'Analyze and summarize the text found in this image.'}
                },
                'required': ['image']
            }
        },
        responses={200: dict}
    )
    def post(self, request, *args, **kwargs):
        serializer = OCRRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        image_file = serializer.validated_data.get('image')
        prompt = serializer.validated_data.get('prompt')

        try:
            # 1. Open the image using Pillow
            img = Image.open(image_file)
            
            # 2. Extract text using pytesseract
            # Point pytesseract to the custom installation path provided by the user
            pytesseract.pytesseract.tesseract_cmd = r'D:\pytess\tesseract.exe'
            extracted_text = pytesseract.image_to_string(img)
            
            if not extracted_text.strip():
                 return Response({"success": False, "error": "No text found in the image."}, status=status.HTTP_400_BAD_REQUEST)
                 
            # 3. Analyze the extracted text with Gemini
            gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
            headers = {
                'Content-Type': 'application/json',
                'X-goog-api-key': settings.GEMINI_API_KEY
            }
            
            full_prompt = f"Extracted Text from Image: {extracted_text}\n\nTask: {prompt}"

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

            response = requests.post(gemini_url, headers=headers, json=payload)
            response.raise_for_status()
            
            response_data = response.json()
            
            try:
                ai_result = response_data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                ai_result = "Could not parse response from Gemini."
            
            logger.info({
                "action": "ocr_analysis",
                "status": "success",
                "extracted_text_length": len(extracted_text)
            })

            return Response({
                "success": True, 
                "extracted_text": extracted_text,
                "ai_analysis": ai_result
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error({
                "action": "ocr_analysis",
                "status": "error",
                "error_message": str(e)
            })
            return Response({"error": "An error occurred during OCR/AI processing."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
