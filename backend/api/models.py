from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    responsible_person = models.CharField(max_length=200, blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return self.name


class Status(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=200, blank=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True)
    current_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    model_number = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    documents = models.FileField(upload_to="docs/", null=True, blank=True)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__(self):
        return self.name


class TransferLog(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    from_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name="from_dept")
    to_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name="to_dept")
    transfer_date = models.DateField()
    note = models.TextField(blank=True)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} transfer"


class RepairStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)

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
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} repair"

