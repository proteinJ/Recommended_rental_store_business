from django.shortcuts import render



def recommendService(request):
    from django.conf import settings
    return render(request, 'recommendService/recommendService.html', {
        'kakao_map_api_key' : settings.KAKAO_MAP_API_KEY,
    })
