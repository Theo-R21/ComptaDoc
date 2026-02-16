from rest_framework import serializers
from user.models import User


class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'phone',
            'last_login',
            'date_joined',
            'is_superuser',
            'username',
            'is_active',
            'email',
            'role'
        ]
        read_only_fields = fields
