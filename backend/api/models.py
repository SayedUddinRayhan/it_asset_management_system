from django.db import models
from autoslug import AutoSlugField
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.db import transaction
import random
class Vendor(models.Model):
    unique_code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.unique_code:
                month = timezone.now().strftime("%m")
                prefix = "VND"
                
                while True:
                    rand_digits = ''.join(random.choices("0123456789", k=3))
                    code = f"{prefix}-{month}{rand_digits}"
                    
                    if not Vendor.objects.filter(unique_code=code).exists():
                        self.unique_code = code
                        break

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Department(models.Model):
    unique_code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    responsible_person = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.unique_code:
                month = timezone.now().strftime("%m")
                prefix = "DEPT"
                
                while True:
                    rand_digits = ''.join(random.choices("0123456789", k=3))
                    code = f"{prefix}-{month}{rand_digits}"
                    
                    if not Department.objects.filter(unique_code=code).exists():
                        self.unique_code = code
                        break

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Status(models.Model):
    unique_code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):

        with transaction.atomic():
            if not self.unique_code:
                month = timezone.now().strftime("%m")
                prefix = "STAT"
                
                while True:
                    rand_digits = ''.join(random.choices("0123456789", k=3))
                    code = f"{prefix}-{month}{rand_digits}"
                    
                    if not Status.objects.filter(unique_code=code).exists():
                        self.unique_code = code
                        break

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class Category(models.Model):
    unique_code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=100, unique=True)
    slug = AutoSlugField(populate_from='name', unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.unique_code:
                month = timezone.now().strftime("%m")
                prefix = "CAT"
                
                while True:
                    rand_digits = ''.join(random.choices("0123456789", k=3))
                    code = f"{prefix}-{month}{rand_digits}"
                    
                    if not Category.objects.filter(unique_code=code).exists():
                        self.unique_code = code
                        break

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    unique_code = models.CharField(max_length=8, unique=True, editable=False, db_index=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT)
    current_department = models.ForeignKey(Department, on_delete=models.PROTECT)
    model_number = models.CharField(max_length=200, blank=True)
    serial_number = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    warranty_years = models.PositiveIntegerField(null=True, blank=True) 
    warranty_end_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.ForeignKey(Status, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        with transaction.atomic():
            if not self.unique_code:
                month = timezone.now().strftime("%m")
                prefix = "PRD"
                
                while True:
                    rand_digits = ''.join(random.choices("0123456789", k=3))
                    code = f"{prefix}-{month}{rand_digits}"
                    
                    if not Product.objects.filter(unique_code=code).exists():
                        self.unique_code = code
                        break


            if self.purchase_date and self.warranty_years is not None:
                self.warranty_end_date = self.purchase_date + relativedelta(years=self.warranty_years)
            else:
                self.warranty_end_date = None

            super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductDocument(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="docs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.file.name}"

class TransferLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    from_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name="from_dept")
    to_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name="to_dept")
    transfer_date = models.DateField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} transfer"


class RepairStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    product_status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class RepairLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    fault_description = models.TextField()
    repair_vendor = models.CharField(max_length=200)
    sent_date = models.DateField()
    received_date = models.DateField(null=True, blank=True)
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.ForeignKey(RepairStatus, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} repair"

