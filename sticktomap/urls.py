from django.conf.urls import patterns, url

from sticktomap import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^save$', views.save, name='save'),
    url(r'^delete$', views.delete, name='delete'),
    url(r'^update$', views.update, name='update'),
    url(r'^add_image$', views.add_image, name='add_image')

)
