from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.shortcuts import render
from django.contrib import messages
from django.shortcuts import redirect

def login_required_with_message(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.warning(request, "로그인 후 이용할 수 있습니다.")
            return redirect(f"{settings.LOGIN_URL}?next={request.path}")
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@login_required_with_message
def recommendService(request):
    from django.conf import settings
    return render(request, 'recommendService/recommendService.html', {
        'kakao_map_api_key' : settings.KAKAO_MAP_API_KEY,
    })
