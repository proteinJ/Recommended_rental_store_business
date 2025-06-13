from django.contrib import admin
from .models import UserProfile  # 실제 모델명에 맞게 수정

admin.site.register(UserProfile)  # 또는 Profile