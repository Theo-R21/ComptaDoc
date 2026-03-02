from rest_framework import serializers
from user.models import User
from user.serializers.role import RoleSerializer


class UserListSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)

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
            'roles',
        ]
        read_only_fields = fields