from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=8)
    role = serializers.ChoiceField(choices=['admin', 'librarian', 'faculty', 'student'], required=False)
