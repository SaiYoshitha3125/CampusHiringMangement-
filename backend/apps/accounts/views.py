from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.accounts.models import User
from apps.accounts.serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer
)
from apps.accounts.permissions import IsPlacementAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens on registration for automatic login
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Registration successful.',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data

        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            from apps.students.serializers import StudentProfileSerializer
            data['student_profile'] = StudentProfileSerializer(user.student_profile).data
        elif user.role == User.Role.RECRUITER and hasattr(user, 'recruiter_profile'):
            from apps.recruiters.serializers import RecruiterProfileSerializer
            data['recruiter_profile'] = RecruiterProfileSerializer(user.recruiter_profile).data

        return Response(data)


class UserManagementViewSet(viewsets.ModelViewSet):
    """Placement Admin user management: list, suspend, or toggle active status."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsPlacementAdmin]
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
