from django.urls import path
from . import views

app_name = "review"

urlpatterns = [
    path('', views.review_list, name='review_list'),
    path('new/', views.review_create, name='review_create'),
]