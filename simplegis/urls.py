from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from customuser.views import CustomRegistrationView, CustomUpdateView
from customuser.forms import RegistrationFormUniqueEmail
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from simplegis import settings
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^', include('sticktomap.urls')),
    url(r'^accounts/register/$', CustomRegistrationView.as_view(
        form_class=RegistrationFormUniqueEmail), 
        name='register'),
    url(r'^accounts/profile/$', login_required(CustomUpdateView.as_view()),
        name='profile'),
    # fix for 1.6
    url(r'^password/change/$',
                auth_views.password_change,
                name='password_change'),
    url(r'^password/change/done/$',
                auth_views.password_change_done,
                name='password_change_done'),
    url(r'^password/reset/$',
                auth_views.password_reset,
                name='password_reset'),
    url(r'^password/reset/done/$',
                auth_views.password_reset_done,
                name='password_reset_done'),
    url(r'^password/reset/complete/$',
                auth_views.password_reset_complete,
                name='password_reset_complete'),
    url(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$',
                auth_views.password_reset_confirm,
                name='password_reset_confirm'),
    (r'^accounts/', include('registration.backends.default.urls')),
    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes':True}),
)
