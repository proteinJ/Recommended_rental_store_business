from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

def login_view(request):
    # 로그인 처리 로직
    return render(request, 'accounts/login.html')

def signup_view(request):
    # 회원가입 처리 로직
    return render(request, 'accounts/signup.html')

def logout_view(request):
    logout(request)  # 세션 로그아웃 처리
    return redirect('home:index')  # 로그아웃 후 홈 페이지 등으로 이동

def terms_privacy(request):
    return render(request, 'accounts/terms_privacy.html')

def terms_usage(request):
    return render(request, 'accounts/terms_usage.html')

def terms_advertising(request):
    return render(request, 'accounts/terms_advertising.html')

def terms_age(request):
    return render(request, 'accounts/terms_age.html')