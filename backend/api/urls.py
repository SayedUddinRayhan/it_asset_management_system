from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, DepartmentViewSet, StatusViewSet, CategoryViewSet, ProductViewSet, ProductDocumentViewSet, TransferLogViewSet, RepairStatusViewSet, RepairLogViewSet, ProductExportExcelView, ProductExportPDFView
from django.urls import path

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'statuses', StatusViewSet, basename='status')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'products/(?P<product_id>\d+)/documents', ProductDocumentViewSet, basename='product-documents')
router.register(r'transfers', TransferLogViewSet, basename='transfer')
router.register(r'repair-statuses', RepairStatusViewSet, basename='repair-status')
router.register(r'repairs', RepairLogViewSet, basename='repair')


export_routes = [
    path('export/products/excel/', ProductExportExcelView.as_view(), name='export-products-excel'),
    path('export/products/pdf/', ProductExportPDFView.as_view(), name='export-products-pdf'),
]


urlpatterns = router.urls + export_routes

