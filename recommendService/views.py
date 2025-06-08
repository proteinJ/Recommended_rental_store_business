from django.shortcuts import render
from django.conf import settings

def recommendService(request):
    return render(request, 'recommendService/recommendService.html', {
        'naver_map_api_key' : settings.NAVER_MAP_API_KEY,
    })