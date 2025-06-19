from django.shortcuts import render

def year_gallery(request):
    years = list(range(2020, 2031))
    return render(request, 'year_gallery.html', {'years': years})