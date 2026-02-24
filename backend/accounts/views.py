# views.py
from rest_framework.generics import CreateAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, CustomTokenSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

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