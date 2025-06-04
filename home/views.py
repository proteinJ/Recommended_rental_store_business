from django.shortcuts import render

def index(request):
    return render(request, 'index.html')  

def priceInfo(request):
    return render(request, 'priceInfo.html')

def introduction(request):
    return render(request, 'introduction.html')
