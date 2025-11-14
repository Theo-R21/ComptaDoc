from rest_framework import serializers
from user.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email']

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'last_login','date_joined','is_superuser','username', 'is_active', 'email']

class UserActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"