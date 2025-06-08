# models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # User 모델과 1:1 관계
    birth_year = models.CharField(max_length=4) # 생년
    birth_month = models.CharField(max_length=2) # 생월
    birth_day = models.CharField(max_length=2) # 생일
    phone = models.CharField(max_length=20) # 전화번호
    agree_marketing = models.BooleanField(default=False)  # 마케팅 동의 여부
    plan_type = models.CharField(max_length=30, blank=True, null=True)  # 요금제명
    plan_purchased = models.BooleanField(default=False)   # 요금제 구입 여부