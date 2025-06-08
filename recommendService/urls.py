from django.urls import path
from .views import recommendService

app_name = "recommendService"

urlpatterns = [
    path('', recommendService, name='recommendService'),
]
