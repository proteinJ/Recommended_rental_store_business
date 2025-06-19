from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
import json
from .models import UserProfile

# 로그인 처리 로직
def login_view(request):
    if request.method == 'POST':
        userid = request.POST.get('userid')
        password = request.POST.get('password')

        user = authenticate(request, username=userid, password=password)
        if user is not None:  # 로그인 성공
            login(request, user)
            print(f"\n✅ [로그인 성공] -----------------------------")
            print(f"  ▶ 아이디: {user.username}")
            print(f"  ▶ DB User ID: {user.id}")
            print(f"  ▶ 이름: {user.first_name}")
            print(f"---------------------------------------------\n")
            return redirect('home:index')
        else:  # 로그인 실패
            print("\n❌ [로그인 실패] 아이디 또는 비밀번호가 올바르지 않습니다.\n")
            messages.error(request, '아이디 또는 비밀번호가 올바르지 않습니다.')
            return render(request, 'registration/login.html')
    else:  # GET 요청 - 로그인 폼 보여주기(처음 화면 렌더링)
        return render(request, 'registration/login.html')

def signup_view(request):
    error_field = None

    if request.method == 'POST':
        username = request.POST.get('username')
        userid = request.POST.get('userid')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm-password')
        userbirth_year = request.POST.get('userbirth-year')
        userbirth_month = request.POST.get('userbirth-month')
        userbirth_day = request.POST.get('userbirth-day')
        userphone = request.POST.get('phone')

        if password != confirm_password:
            error_field = 'confirm-password'
            print("\n❌ [회원가입 실패] 비밀번호가 일치하지 않습니다.\n")
            messages.error(request, '비밀번호가 일치하지 않습니다.')
            return render(request, 'accounts/signup.html', {'error_field': error_field})
        elif User.objects.filter(username=userid).exists():
            error_field = 'userid'
            print("\n❌ [회원가입 실패] userid가 이미 존재합니다.\n")
            messages.error(request, '이미 존재하는 아이디입니다.')
            return render(request, 'accounts/signup.html', {'error_field': error_field})
        else:
            # 회원 생성
            user = User.objects.create_user(
                username=userid,
                password=password,
                first_name=username
            )
            UserProfile.objects.create(
                user=user,
                birth_year=userbirth_year,
                birth_month=userbirth_month,
                birth_day=userbirth_day,
                phone=userphone
            )
            print(f"\n✅ [회원가입 성공] -----------------------------")
            print(f"  아이디: {user.username}")
            print(f"  DB User ID: {user.id}")
            print(f"  ▶ 이름: {user.first_name}")
            print(f"  ▶ 생년월일: {userbirth_year}-{userbirth_month}-{userbirth_day}")
            print(f"  ▶ 전화번호: {userphone}")
            print(f"-----------------------------------------------\n")
            messages.success(request, '회원가입이 완료되었습니다. 로그인 해주세요!')
            return redirect('accounts:login')
        
    return render(request, 'accounts/signup.html', {
        'error_field': error_field,
    })

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

def price_info(request):
    user_profile = None
    if request.user.is_authenticated:
        try:
            user_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            user_profile = None
    return render(request, 'priceInfo.html', {
        'user_profile': user_profile,
    })

def upgrade_plan(request):
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'error': '로그인 필요'}, status=403)
    if request.method == 'POST':
        data = json.loads(request.body)
        plan_type = data.get('plan_type')
        if plan_type not in ['Free', 'Plus', 'Pro']:
            return JsonResponse({'success': False, 'error': '잘못된 플랜'}, status=400)
        try:
            profile = UserProfile.objects.get(user=request.user)
            profile.plan_type = plan_type
            profile.save()
            return JsonResponse({'success': True})
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'error': '프로필 없음'}, status=404)
    return JsonResponse({'success': False, 'error': '잘못된 요청'}, status=400)