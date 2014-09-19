from django.conf.urls import patterns, url
from sticktomap import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^track_save$', views.track_save, name='track_save'),
    url(r'^track_delete$', views.track_delete, name='track_delete'),
    url(r'^track$', views.track_get, name='track'),
    url(r'^placemark_save$', views.placemark_save, name='placemark_save'),
    url(r'^placemark_delete$', views.placemark_delete, name='placemark_delete'),
    url(r'^placemark_update$', views.placemark_update, name='placemark_update'),
    url(r'^placemark_img_upload$', views.placemark_img_upload, name='placemark_img_upload'),
)
