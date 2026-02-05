from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, DepartmentViewSet, StatusViewSet, CategoryViewSet, ProductViewSet, TransferLogViewSet, RepairStatusViewSet, RepairLogViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'statuses', StatusViewSet, basename='status')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'transfers', TransferLogViewSet, basename='transfer')
router.register(r'repair-statuses', RepairStatusViewSet, basename='repair-status')
router.register(r'repairs', RepairLogViewSet, basename='repair')

urlpatterns = router.urls
