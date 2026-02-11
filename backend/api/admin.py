from django.contrib import admin
from .models import Vendor, Department, Status, Category, Product, TransferLog, RepairStatus, RepairLog

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "is_active", "created_at", "updated_at")
    search_fields = ("name", "phone", "email")
    list_filter = ("is_active",)
    ordering = ("-created_at",)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "responsible_person", "is_active", "created_at", "updated_at")
    search_fields = ("name", "location", "responsible_person")
    list_filter = ("is_active",)
    ordering = ("-created_at",)


@admin.register(Status)
class StatusAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at", "updated_at")
    search_fields = ("name",)
    list_filter = ("is_active",)
    ordering = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at", "updated_at")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)
    readonly_fields = ('slug',)
    ordering = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "vendor", "current_department", "quantity", "price", "status", "is_active", "purchase_date", "warranty_years", "warranty_end_date")
    search_fields = ("name", "model_number", "category__name", "vendor__name")
    list_filter = ("status", "category", "vendor", "current_department", "is_active", "warranty_years")
    ordering = ("-created_at",)


@admin.register(TransferLog)
class TransferLogAdmin(admin.ModelAdmin):
    list_display = ("product", "from_department", "to_department", "transfer_date", "created_at")
    search_fields = ("product__name", "from_department__name", "to_department__name")
    list_filter = ("from_department", "to_department")
    ordering = ("-created_at",)


@admin.register(RepairStatus)
class RepairStatusAdmin(admin.ModelAdmin):
    list_display = ("name", "product_status", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)
    ordering = ("name",)


@admin.register(RepairLog)
class RepairLogAdmin(admin.ModelAdmin):
    list_display = ("product", "fault_description", "repair_vendor", "sent_date", "received_date", "repair_cost", "status", "created_at")
    search_fields = ("product__name", "repair_vendor", "status__name")
    list_filter = ("status",)
    ordering = ("-created_at",)
