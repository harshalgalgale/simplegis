from django.conf.urls import patterns, url

from sticktomap import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^save$', views.save, name='save')
)
