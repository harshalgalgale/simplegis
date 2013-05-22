from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from sticktomap.views import register

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include('sticktomap.urls')),
    url(r'^login/', 'sticktomap.views.login', name = 'login'),
    url(r'^auth/login/', 'django.contrib.auth.views.login'),
    url(r'^logout/', 'sticktomap.views.logout', name = 'logout'),
    url(r'^register/', 'sticktomap.views.register', name = 'register'),
    url(r'^profile/', 'sticktomap.views.profile', name = 'profile'),
)
