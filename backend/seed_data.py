import os
import django
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Profile, Area, STS, Landfill, Van, Truck, WasteType, WasteCollectionRequest

def create_or_get_user(username, email, password, role):
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user, role=role)
        print(f"Created user: {username} ({role})")
    return user

print("Seeding database...")

# 1. Create Users
admin = create_or_get_user('admin', 'admin@example.com', 'password123', 'admin')
sts_mgr = create_or_get_user('sts_manager', 'sts@example.com', 'password123', 'sts_manager')
landfill_mgr = create_or_get_user('landfill_mgr', 'landfill@example.com', 'password123', 'landfill_manager')
driver1 = create_or_get_user('van_driver_1', 'vd1@example.com', 'password123', 'driver')
driver2 = create_or_get_user('van_driver_2', 'vd2@example.com', 'password123', 'driver')
truck_driver = create_or_get_user('truck_driver', 'td@example.com', 'password123', 'truck_owner')
house_owner1 = create_or_get_user('house1', 'h1@example.com', 'password123', 'house_owner')
house_owner2 = create_or_get_user('house2', 'h2@example.com', 'password123', 'house_owner')

# 2. Create Waste Types
waste_types = ['Organic', 'Plastic', 'Paper', 'Metal', 'Glass', 'E-Waste', 'Hazardous']
for wt in waste_types:
    WasteType.objects.get_or_create(name=wt, defaults={'description': f"{wt} waste category"})

# 3. Create Area
area, _ = Area.objects.get_or_create(
    name='Mirpur',
    defaults={'latitude': 23.8052, 'longitude': 90.3696, 'radius_km': 10.0}
)
area2, _ = Area.objects.get_or_create(
    name='Gulshan',
    defaults={'latitude': 23.7925, 'longitude': 90.4078, 'radius_km': 8.0}
)

# 4. Create Landfill
landfill, _ = Landfill.objects.get_or_create(
    name='Amin Bazar Landfill',
    defaults={'latitude': 23.8105, 'longitude': 90.3160, 'manager': landfill_mgr}
)

# 5. Create STS
sts, _ = STS.objects.get_or_create(
    name='STS Mirpur 10',
    defaults={
        'area': area,
        'capacity_tonnes': 80.0,
        'current_fill_tonnes': 62.0,
        'latitude': 23.8052,
        'longitude': 90.3696,
        'manager': sts_mgr
    }
)

# 6. Create Vans
van1, _ = Van.objects.get_or_create(
    registration_number='V-1001',
    defaults={
        'capacity_kg': 1000.0,
        'current_load_kg': 0.0,
        'max_trips_per_day': 3,
        'status': 'idle',
        'sts': sts,
        'driver': driver1
    }
)

van2, _ = Van.objects.get_or_create(
    registration_number='V-1002',
    defaults={
        'capacity_kg': 1500.0,
        'current_load_kg': 0.0,
        'max_trips_per_day': 2,
        'status': 'idle',
        'sts': sts,
        'driver': driver2
    }
)

# 7. Create Truck
truck, _ = Truck.objects.get_or_create(
    registration_number='T-9901',
    defaults={
        'capacity_tonnes': 15.0,
        'current_load_tonnes': 0.0,
        'status': 'idle',
        'base_fuel_cost_per_km': 0.8,
        'landfill': landfill,
        'driver': truck_driver
    }
)

# 8. Create Waste Requests
req1, _ = WasteCollectionRequest.objects.get_or_create(
    user=house_owner1,
    waste_type=WasteType.objects.get(name='Organic'),
    weight=12.5,
    defaults={
        'latitude': 23.8060,
        'longitude': 90.3700,
        'area': area,
        'status': 'pending'
    }
)

req2, _ = WasteCollectionRequest.objects.get_or_create(
    user=house_owner2,
    waste_type=WasteType.objects.get(name='Plastic'),
    weight=5.2,
    defaults={
        'latitude': 23.8040,
        'longitude': 90.3680,
        'area': area,
        'status': 'pending'
    }
)

print("Demo data seeded successfully!")
