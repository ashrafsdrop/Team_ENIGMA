from django.contrib import admin
from .models import Item, ItemImage, Profile, WasteCollectionRequest, WasteType, STS, Landfill, Van, Truck, DumpRequest

admin.site.register(Item)
admin.site.register(ItemImage)
admin.site.register(Profile)
admin.site.register(WasteCollectionRequest)
admin.site.register(WasteType)
admin.site.register(STS)
admin.site.register(Landfill)
admin.site.register(Van)
admin.site.register(Truck)
admin.site.register(DumpRequest)
