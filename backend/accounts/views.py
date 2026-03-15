# views.py
from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status, generics, filters
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from .serializers import (
    RegisterSerializer, CustomTokenSerializer, UserSerializer,
    PermissionSerializer, UserPermissionSerializer
)

User = get_user_model()


# ── Custom permission classes ──────────────────────────────────────────────────

class IsSuperUser(BasePermission):
    """Only superusers may access this view."""
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsSuperUserOrReadOnly(BasePermission):
    """Superusers get full access; others get read-only."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


# ── Auth ───────────────────────────────────────────────────────────────────────

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = CustomTokenSerializer.get_token(user)
        return Response(
            {
                "user": UserSerializer(user).data,
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


# ── User management ────────────────────────────────────────────────────────────

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["phone", "first_name", "last_name"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.all().order_by("-id")
        # Non-superusers cannot see superuser accounts
        if not self.request.user.is_superuser:
            qs = qs.exclude(is_superuser=True)
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.prefetch_related(
        "user_permissions__content_type"
    ).all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        # Only superusers can view/edit/delete other superuser accounts
        if obj.is_superuser and not self.request.user.is_superuser:
            raise PermissionDenied("You cannot manage superuser accounts.")
        return obj

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            raise PermissionDenied("You do not have permission to delete users.")
        return super().destroy(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.request.method in ("PATCH", "PUT"):
            return UserSerializer
        return UserPermissionSerializer


# ── Permissions ────────────────────────────────────────────────────────────────

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.select_related("content_type").all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class SetUserPermissions(APIView):
    """
    Only superusers can assign permissions.
    Superuser accounts themselves cannot have their permissions modified
    since their access is implicit.
    """
    permission_classes = [IsAuthenticated, IsSuperUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_superuser:
            return Response(
                {"detail": "Superusers have all permissions by default. No changes needed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        perm_ids = request.data.get("permissions", [])
        if not isinstance(perm_ids, list):
            return Response(
                {"detail": "'permissions' must be a list of IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        permissions = Permission.objects.filter(id__in=perm_ids)
        user.user_permissions.set(permissions)
        return Response({"detail": "Permissions updated successfully."})