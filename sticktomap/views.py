# -*- coding: utf-8 -*-

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
from django.contrib.auth import login as auth_login, logout as auth_logout, REDIRECT_FIELD_NAME
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.models import UserManager
from django.shortcuts import redirect, render, render_to_response
from sticktomap.models import Placemark
from sticktomap.forms import UploadImageForm
from django.core.urlresolvers import resolve
import json


@login_required()
@csrf_protect
def index(request):
    form = UploadImageForm()
    placemarks = Placemark.objects.filter(user=request.user)
    return render_to_response('index.html', {'placemarks': placemarks, 'form': form},
                          context_instance=RequestContext(request))
@csrf_protect
@login_required(login_url='/login')
def save(request):
    if request.is_ajax():
        name, descr, lat, lon = request.POST.get('placemarkString', '').split()
        placemark = Placemark()
        placemark.name = name
        placemark.descr = descr
        placemark.lat = lat
        placemark.lon = lon
        placemark.user = request.user
        placemark.save()
        json_response = json.dumps({"id": placemark.id})
        return HttpResponse(json_response, content_type='application/json')
    else:
        return HttpResponse(status=400)


@csrf_protect
@login_required()
def update(request):
    if request.is_ajax():
        name, descr, id = request.POST.get('geoobjectString', '').split()
        placemark = Placemark.objects.get(id=int(id))
        placemark.name = name
        placemark.descr = descr
        placemark.save()
        return HttpResponse()
    else:
        return HttpResponse(status=400)

@csrf_protect
@login_required()
def delete(request):
    if request.is_ajax():
        placemark = Placemark.objects.get(id=int(request.POST.get('id', ''))).delete()
        return HttpResponse()
    else:
        return HttpResponse(status=400)

@csrf_protect
@login_required()
def add_image(request):
    if request.method == 'POST':
        p = Placemark.objects.get(id=int(request.POST.get('id','')))
        p.img = request.FILES['image']
        return HttpResponse(json.dumps([True]), mimetype='application/javascript')
    else:
        return HttpResponse(json.dumps([False]), mimetype='application/javascript')


    

def login(request):
    if not request.user.is_authenticated():
        return redirect('django.contrib.auth.views.login')
    return redirect('sticktomap.views.index')

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect('/')

@login_required()
@sensitive_post_parameters()
@csrf_protect
@never_cache
def profile(request):
    if request.method == 'POST':
        form = UserChangeForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
    else:
        form = UserChangeForm(instance=request.user)
    
    return render_to_response( 'registration/profile.html', locals(), context_instance = RequestContext( request) )
    

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
            #if not is_safe_url(url=redirect_to, host=request.get_host()):
            #    redirect_to = resolve(settings.LOGIN_REDIRECT_URL)

            #create user
            form.save()

            return HttpResponse("<p>Вы успешно зарегистрированы.</p><p><a href=\"/\">На главную</a></p>")
    else:
        form = user_creation_form()

    context = {
            'form': form,
            redirect_field_name: redirect_to,
    }
    return TemplateResponse(request, template_name, context,
                            current_app=current_app)
