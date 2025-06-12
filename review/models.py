# models.py
from django.db import models
# from django.contrib.auth.models import User

class Review(models.Model):
    # user = models.ForeignKey(User, on_delete=models.CASCADE)  # User와 연결
    username = models.CharField(max_length=10) # 닉네임
    content = models.TextField() # 내용
    rating = models.IntegerField(default=5) # 별점
    recommended_business = models.CharField(max_length=10) # 추천받은 업종
    created_at = models.DateTimeField(auto_now_add=True) # 작성일시