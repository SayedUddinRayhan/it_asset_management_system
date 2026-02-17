from rest_framework import serializers
from .models import Vendor, Department, Status, Category, Product, ProductDocument, TransferLog, RepairStatus, RepairLog, RepairMovement

class VendorSerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(read_only=True)
    class Meta:
        model = Vendor
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(read_only=True)
    class Meta:
        model = Department
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(read_only=True)
    class Meta:
        model = Status
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(read_only=True)
    class Meta:
        model = Category
        fields = '__all__'


class ProductDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDocument
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(read_only=True)
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    department_name = serializers.CharField(source='current_department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    documents = ProductDocumentSerializer(many=True, read_only=True)
    status = serializers.PrimaryKeyRelatedField(queryset=Status.objects.all(), required=False)
    
    class Meta:
        model = Product
        fields = ['id', 'unique_code', 'name', 'model_number', 'serial_number', 'description', 'purchase_date', 'warranty_years', 
                  'warranty_end_date', 'quantity', 'price', 'vendor', 'current_department', 'category', 
                  'status', 'created_at', 'updated_at',
                  'vendor_name', 'department_name', 'category_name', 'status_name', 'documents']

    def update(self, instance, validated_data):
        validated_data.pop("status", None)  
        return super().update(instance, validated_data)
            


class TransferLogSerializer(serializers.ModelSerializer):
    unique_code = serializers.CharField(source='product.unique_code', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    from_department_name = serializers.CharField(source='from_department.name', read_only=True)
    to_department_name = serializers.CharField(source='to_department.name', read_only=True)
    transfer_date = serializers.DateField(read_only=True)

    class Meta:
        model = TransferLog
        fields = '__all__'
        read_only_fields = ['from_department', 'transfer_date']


    




class RepairStatusSerializer(serializers.ModelSerializer):
    product_status_name = serializers.CharField(source='product_status.name', read_only=True)
    class Meta:
        model = RepairStatus
        fields = '__all__'


class RepairLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_code = serializers.CharField(source="product.unique_code", read_only=True)
    status_name = serializers.CharField(source="status.name", read_only=True)
    repair_vendor_name = serializers.CharField(source="repair_vendor.name", read_only=True)

    repair_vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.filter(is_active=True), required=False, allow_null=True)

    class Meta:
        model = RepairLog
        fields = "__all__"

    
    def validate(self, data):
        sent = data.get("sent_date")
        received = data.get("received_date")

        if sent and received and received < sent:
            raise serializers.ValidationError({
                "received_date": "Received date cannot be before sent date."
            })
        return data



class RepairMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_code = serializers.CharField(source="product.unique_code", read_only=True)
    status_name = serializers.CharField(source="status.name", read_only=True)
    vendor_name = serializers.CharField(source="to_vendor.name", read_only=True)
    from_department_name = serializers.CharField(source="from_department.name", read_only=True)

    class Meta:
        model = RepairMovement
        fields = "__all__"




