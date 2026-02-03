from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Vendor, Department, Status, Product, TransferLog, RepairStatus, RepairLog
from .serializers import VendorSerializer, DepartmentSerializer, StatusSerializer, ProductSerializer, TransferLogSerializer, RepairStatusSerializer, RepairLogSerializer


class VendorViewSet(ModelViewSet):
    queryset = Vendor.objects.all().order_by("-created_at")
    serializer_class = VendorSerializer


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all().order_by("-created_at")
    serializer_class = DepartmentSerializer


class StatusViewSet(ModelViewSet):
    queryset = Status.objects.filter(is_active=True).order_by("name")
    serializer_class = StatusSerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related(
        "vendor", "current_department", "status"
    ).order_by("-created_at")
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["status", "category", "current_department"]
    search_fields = ["name", "model_number"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class TransferLogViewSet(ModelViewSet):
    queryset = TransferLog.objects.select_related(
        "product", "from_department", "to_department"
    ).order_by("-created_at")
    serializer_class = TransferLogSerializer

    def perform_create(self, serializer):
        transfer = serializer.save()
        if transfer.product:
            transfer.product.current_department = transfer.to_department
            transfer.product.save()

class RepairStatusViewSet(ModelViewSet):
    queryset = RepairStatus.objects.filter(is_active=True).order_by("name")
    serializer_class = RepairStatusSerializer


class RepairLogViewSet(ModelViewSet):
    queryset = RepairLog.objects.select_related(
        "product", "status"
    ).order_by("-created_at")
    serializer_class = RepairLogSerializer

    def perform_update(self, serializer):
        repair = serializer.save()

        if repair.product and repair.status and repair.status.product_status:
            repair.product.status = repair.status.product_status
            repair.product.save()
