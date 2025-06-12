from django.views.generic import TemplateView
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', include('home.urls')),
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('recommendService/', include('recommendService.urls', namespace='recommendService')),
    path('introduction/', TemplateView.as_view(template_name='introduction.html'), name='introduction'),
    path('priceInfo/', TemplateView.as_view(template_name='priceInfo.html'), name='priceInfo'),
    path('review/', include('review.urls', namespace='review')),
]
