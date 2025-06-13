# accounts/urls.py
from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('terms_privacy/', views.terms_privacy, name='terms_privacy'),
    path('terms_usage/', views.terms_usage, name='terms_usage'),
    path('terms_advertising/', views.terms_advertising, name='terms_advertising'),
    path('terms_age/', views.terms_age, name='terms_age'),
    path('priceInfo/', views.price_info, name='priceInfo'),
    path('upgrade_plan/', views.upgrade_plan, name='upgrade_plan'),
]
