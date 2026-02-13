from rest_framework import serializers
from .models import Vendor, Department, Status, Category, Product, ProductDocument, TransferLog, RepairStatus, RepairLog

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDocument
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    department_name = serializers.CharField(source='current_department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    documents = ProductDocumentSerializer(many=True, read_only=True)
    status = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), required=False)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'model_number', 'serial_number', 'description', 'purchase_date', 'warranty_years', 
                  'warranty_end_date', 'quantity', 'price', 'vendor', 'current_department', 'category', 
                  'status', 'created_at', 'updated_at',
                  'vendor_name', 'department_name', 'category_name', 'status_name', 'documents']

   # Prevent status changes when editing from "Edit Product" form
    def update(self, instance, validated_data):
        validated_data.pop("status", None)  # ignore status updates
        return super().update(instance, validated_data)
            


class TransferLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransferLog
        fields = '__all__'



class RepairStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairStatus
        fields = '__all__'


class RepairLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairLog
        fields = '__all__'


