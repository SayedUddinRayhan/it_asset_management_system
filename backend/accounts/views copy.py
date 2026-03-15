from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, filters
from django.contrib.auth import get_user_model
from .models import User
from .serializers import (
    RegisterSerializer, CustomTokenSerializer, UserSerializer,
    PermissionSerializer, UserPermissionSerializer
)
from django.contrib.auth.models import Permission


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = CustomTokenSerializer.get_token(user)
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
            "is_superuser": user.is_superuser,
            "permissions": list(
                user.user_permissions.values_list("codename", flat=True)
            ),
        })


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["phone", "first_name", "last_name"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = User.objects.all().order_by("-id")

        # Non-superusers cannot see superuser accounts
        if not user.is_superuser:
            qs = qs.exclude(is_superuser=True)

        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()

        # ✅ Only superusers can view/edit other superusers
        if obj.is_superuser and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot manage superuser accounts.")

        return obj

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return UserSerializer
        return UserPermissionSerializer



class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.select_related("content_type").all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class SetUserPermissions(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Block non-superusers from touching superuser permissions
        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {"detail": "You cannot manage superuser permissions."},
                status=status.HTTP_403_FORBIDDEN
            )

        perm_ids = request.data.get("permissions", [])
        permissions = Permission.objects.filter(id__in=perm_ids)
        user.user_permissions.set(permissions)
        return Response({"detail": "Permissions updated"})