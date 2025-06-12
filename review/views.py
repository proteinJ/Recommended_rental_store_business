from django.shortcuts import render, redirect
from .models import Review
from .forms import ReviewForm

def review_list(request):
    reviews = Review.objects.order_by('-created_at')
    return render(request, 'review/review_list.html', {'reviews': reviews})

def review_create(request):
    if request.method == 'POST':
        form = ReviewForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('review/review_list')
    else:
        form = ReviewForm()
    return render(request, 'review/review_form.html', {'form': form})