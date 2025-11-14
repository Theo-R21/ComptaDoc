import datetime

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        self.user.last_login = datetime.datetime.now()
        self.user.save(update_fields=["last_login"])
        return data
