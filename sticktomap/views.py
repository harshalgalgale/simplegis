from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.utils.http import is_safe_url
from django.conf import settings
from django.template.response import TemplateResponse
from django.template import RequestContext, Context
from django.template.loader import render_to_string
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import REDIRECT_FIELD_NAME, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import UserManager
from django.shortcuts import redirect, render, render_to_response
from sticktomap.models import Placemark
from django import forms
from django.core.urlresolvers import resolve



def index(request):
    placemarks = Placemark.objects.all() #filter(user=request.user)
    return render_to_response('index.html', {
        'placemarks': placemarks,
        'content': render_to_string('index.html', {'placemarks': placemarks}),
    })

@csrf_exempt
def save(request):
    if request.method == 'POST':
        name, desc, lat, lon = request.POST.get('placemarkString', '').split()
        placemark = Placemark()
        placemark.name = name
        placemark.desc = desc
        placemark.lat = lat
        placemark.lon = lon
        placemark.user = request.user
        placemark.save()
    return HttpResponse()


def login(request):
    if not request.user.is_authenticated():
        return redirect('django.contrib.auth.views.login')
    return redirect('sticktomap.views.index')

@login_required
@sensitive_post_parameters()
@csrf_protect
@never_cache
def profile(request):
    # display profile form for current user
    form = UserChangeForm()
    context = {
            'form': form
    }
    return TemplateResponse(request, 'registration/profile.html', context,
                            current_app=None)

@sensitive_post_parameters()
@csrf_protect
@never_cache
def register(request, template_name='registration/register.html',
          redirect_field_name=REDIRECT_FIELD_NAME,
          user_creation_form=UserCreationForm,
          current_app=None, extra_context=None):
    """
    Displays the registration form.
    """
    redirect_to = request.REQUEST.get(redirect_field_name, '')

    if request.method == "POST":
        form = user_creation_form(data=request.POST)
        if form.is_valid():

            # Ensure the user-originating redirection url is safe.
            if not is_safe_url(url=redirect_to, host=request.get_host()):
                redirect_to = resolve(settings.LOGIN_REDIRECT_URL)

            #create user
            form.save()

            return HttpResponseRedirect(redirect_to)
    else:
        form = user_creation_form()

    context = {
            'form': form,
            redirect_field_name: redirect_to,
    }
    return TemplateResponse(request, template_name, context,
                            current_app=current_app)
