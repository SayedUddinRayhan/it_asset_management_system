from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, filters
from django.contrib.auth import get_user_model
from .models import User
from .serializers import RegisterSerializer, CustomTokenSerializer, UserSerializer, PermissionSerializer, UserPermissionSerializer
from django.contrib.auth.models import Permission



class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens using your CustomTokenSerializer
        token = CustomTokenSerializer.get_token(user)

        # Return user data + tokens
        return Response(
            {
                "user": {
                    "id": user.id,
                    "phone": user.phone,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
                "tokens": {
                    "access": str(token.access_token),
                    "refresh": str(token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })
    


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter] 
    search_fields = ["phone", "first_name", "last_name"] 
    permission_classes = [IsAuthenticated]


# 🔹 List all permissions
class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

# 🔹 Get user with permissions
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserPermissionSerializer
    permission_classes = [IsAuthenticated]

# 🔹 Set permissions for user
class SetUserPermissions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            perms = request.data.get("permissions", [])
            permissions = Permission.objects.filter(id__in=perms)
            user.user_permissions.set(permissions)
            user.save()
            return Response({"detail": "Permissions updated"})
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)