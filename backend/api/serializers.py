from rest_framework import serializers
from .models import Vendor, Department, Status, Category, Product, TransferLog, RepairStatus, RepairLog


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

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    department_name = serializers.CharField(source='current_department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'model_number', 'category_name',
            'vendor_name', 'department_name', 'status_name', 'price',
        ]



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


