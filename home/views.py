from django.shortcuts import render

def index(request):
    return render(request, 'home/index.html', {})

def priceInfo(request):
    return render(request, 'home/priceInfo.html')

def introduction(request):
    return render(request, 'home/introduction.html')
