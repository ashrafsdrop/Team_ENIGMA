from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (
        ('sts_manager', 'STS Manager'),
        ('area_head', 'Area Head'),
        ('driver', 'Driver'),
        ('house_owner', 'House Owner'),
        ('landfill_manager', 'Landfill Manager'),
        ('truck_owner', 'Truck Owner'),
        ('admin', 'Admin'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='house_owner')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

class Item(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='item-images/')
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.item.name} image #{self.pk}'

class WasteType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Area(models.Model):
    name = models.CharField(max_length=255, unique=True)
    latitude = models.FloatField(default=0.0, help_text="Center latitude of the area")
    longitude = models.FloatField(default=0.0, help_text="Center longitude of the area")
    radius_km = models.FloatField(default=5.0, help_text="Radius of the area in kilometers")
    
    def __str__(self):
        return self.name

class STS(models.Model):
    name = models.CharField(max_length=255)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='sts_stations')
    capacity_tonnes = models.FloatField(help_text="Maximum capacity in tonnes")
    current_fill_tonnes = models.FloatField(default=0.0)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_sts')
    last_collected = models.DateTimeField(null=True, blank=True, help_text="Time of last truck dispatch")

    def __str__(self):
        return self.name

class Landfill(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_landfills')

    def __str__(self):
        return self.name

class Van(models.Model):
    STATUS_CHOICES = (
        ('idle', 'Idle (At STS)'),
        ('collecting', 'Out Collecting'),
        ('returning', 'Returning to STS'),
    )
    registration_number = models.CharField(max_length=50, unique=True)
    capacity_kg = models.FloatField(help_text="Maximum capacity in kg")
    current_load_kg = models.FloatField(default=0.0)
    trips_today = models.IntegerField(default=0, help_text="Number of trips completed today")
    max_trips_per_day = models.IntegerField(default=2, help_text="Maximum allowed trips per day")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='idle')
    sts = models.ForeignKey(STS, on_delete=models.CASCADE, related_name='vans')
    driver = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='van')

    def __str__(self):
        return f"Van {self.registration_number} (STS: {self.sts.name})"

class Truck(models.Model):
    STATUS_CHOICES = (
        ('idle', 'Idle at Landfill'),
        ('moving', 'Moving to STS'),
        ('loading', 'Loading at STS'),
        ('returning', 'Returning to Landfill'),
    )
    registration_number = models.CharField(max_length=50, unique=True)
    capacity_tonnes = models.FloatField(help_text="Maximum capacity in tonnes")
    current_load_tonnes = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='idle')
    base_fuel_cost_per_km = models.FloatField(default=0.5, help_text="Liters per km when empty")
    load_fuel_penalty = models.FloatField(default=0.05, help_text="Extra liters per km per tonne of load")
    landfill = models.ForeignKey(Landfill, on_delete=models.CASCADE, related_name='trucks')
    driver = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='truck')
    hours_driven_today = models.FloatField(default=0.0)

    def __str__(self):
        return f"Truck {self.registration_number} (Landfill: {self.landfill.name})"

class WasteCollectionRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('collected', 'Collected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_requests')
    waste_type = models.ForeignKey(WasteType, on_delete=models.SET_NULL, null=True, blank=True)
    weight = models.FloatField(help_text="Weight of the waste in kg", default=0.0)
    latitude = models.FloatField(help_text="Latitude of the location", default=0)
    longitude = models.FloatField(help_text="Longitude of the location", default=0)
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='waste_requests')
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_waste_requests')
    image = models.ImageField(upload_to='waste_images/', blank=True, null=True, help_text="Image of the waste")
    description = models.TextField(blank=True, null=True, help_text="AI generated description of the waste")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.status} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class DumpRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('verified', 'Verified - Match'),
        ('flagged', 'Verified - Discrepancy Flagged'),
    )
    van = models.ForeignKey(Van, on_delete=models.CASCADE, related_name='dump_requests')
    sts = models.ForeignKey(STS, on_delete=models.CASCADE, related_name='dump_requests')
    declared_weight_kg = models.FloatField(help_text="Weight logged by driver (automatically derived from van's current load)")
    actual_weight_kg = models.FloatField(null=True, blank=True, help_text="Actual weight verified by STS Manager")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dump {self.id} - Van {self.van.registration_number} - {self.status}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

class WasteTransfer(models.Model):
    STATUS_CHOICES = (
        ('requested', 'Truck Requested by STS'),
        ('truck_assigned', 'Truck Assigned by Landfill'),
        ('in_transit', 'In Transit (Left STS)'),
        ('received', 'Received at Landfill - Verified'),
        ('flagged', 'Received at Landfill - Discrepancy Flagged'),
    )
    sts = models.ForeignKey(STS, on_delete=models.CASCADE, related_name='waste_transfers')
    truck = models.ForeignKey(Truck, on_delete=models.SET_NULL, null=True, blank=True, related_name='waste_transfers')
    requested_tonnes = models.FloatField(help_text="Estimated tonnes STS wants to transfer")
    weight_leaving_sts = models.FloatField(null=True, blank=True, help_text="Logged by STS Manager on departure")
    weight_arriving_landfill = models.FloatField(null=True, blank=True, help_text="Logged by Landfill Manager on arrival")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='requested')
    created_at = models.DateTimeField(auto_now_add=True)
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Transfer {self.id} from {self.sts.name} - {self.status}"
