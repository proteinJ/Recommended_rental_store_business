from django.urls import path
from . import views

app_name = 'home' # 앱의 이름 공간을 정의하여 URL 이름 충돌 방지 (선택 사항)

urlpatterns = [
    path('', views.index, name='index'), # 'home:index'로 참조 가능
    path('priceInfo/', views.priceInfo, name='priceInfo'),
    path('introduction/', views.introduction, name='introduction'),
]