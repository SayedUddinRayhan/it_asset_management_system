# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import Permission

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Single source of truth for the public user shape.
    Used in RegisterView, LoginView, CurrentUserView, and UserListView.
    """
    class Meta:
        model = User
        fields = [
            "id", "phone", "first_name", "last_name",
            "is_active", "is_superuser", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_superuser", "created_at", "updated_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["phone", "first_name", "last_name", "password"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            phone=validated_data["phone"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )


class CustomTokenSerializer(TokenObtainPairSerializer):
    username_field = "phone"

    @classmethod
    def get_token(cls, user):
        return super().get_token(user)

    def validate(self, attrs):
        data = super().validate(attrs)
        # Reuse UserSerializer — one place to update user shape
        user_data = UserSerializer(self.user).data
        return {
            "tokens": {
                "access": data["access"],
                "refresh": data["refresh"],
            },
            "user": {
                **user_data,
                "permissions": list(
                    self.user.user_permissions.values_list("codename", flat=True)
                ),
            },
        }


class PermissionSerializer(serializers.ModelSerializer):
    content_type = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ["id", "name", "codename", "content_type"]

    def get_content_type(self, obj):
        if not obj.content_type:
            return None
        return {
            "model": obj.content_type.model,
            "app_label": obj.content_type.app_label,
        }


class UserPermissionSerializer(serializers.ModelSerializer):
    """Used in UserDetailView GET — includes full permission objects."""
    permissions = PermissionSerializer(
        many=True, read_only=True, source="user_permissions"
    )

    class Meta:
        model = User
        fields = [
            "id", "phone", "first_name", "last_name",
            "is_active", "is_superuser", "permissions",
        ]