from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .agent import run_agent

class ChatbotAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response({"error": "Message is required"}, status=400)

        session_id = f"user_{request.user.id}"
        reply = run_agent(session_id, message)
        return Response({"reply": reply})