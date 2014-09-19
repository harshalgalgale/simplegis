# -*- coding: utf-8 -*-

from django.http import HttpResponse
from django.utils.http import is_safe_url
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from sticktomap.models import Placemark, Track
import json

from django.views.generic import View


@login_required()
@csrf_protect
def index(request):
    placemarks = Placemark.objects.filter(user=request.user)
    tracks = Track.objects.filter(user=request.user).defer('track', 'descr')
    return render(request, 'index.html', {'placemarks': placemarks, 'tracks': tracks})


@login_required()
@csrf_exempt
def track_save(request):
    if request.is_ajax:
        t = Track()
        json_data = json.loads(request.body)
        t.name = json_data['options']['name']
        t.descr = json_data['options']['descr']
        t.color = json_data['options']['color']
        t.track = json.dumps(json_data['track'])
        t.user = request.user
        t.save()
        json_response = json.dumps({"id": t.id, "name": t.name, "color": t.color})
        return HttpResponse(json_response, content_type='application/json')
    else:
        return HttpResponse(status=400)


@login_required
def track_get(request):
    json_response = Track.objects.get(id=int(request.GET.get('id',''))).track
    return HttpResponse(json_response, content_type='application/json')

@login_required
@csrf_exempt
def track_delete(request):
    if request.is_ajax():
        try:
            track = Track.objects.get(id=int(request.body)).delete()
        except Track.DoesNotExist:
            HttpResponse(status=404)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)

@csrf_protect
@login_required()
def placemark_save(request):
    if request.is_ajax():
        if request.POST:
            placemark = Placemark()
            placemark.name = request.POST.get('name', '')
            placemark.descr = request.POST.get('descr', '')
            placemark.lat = request.POST.get('lat', '')
            placemark.lon = request.POST.get('lon', '')
            placemark.user = request.user
            placemark.save()
            json_response = json.dumps({"id": placemark.id})
            return HttpResponse(json_response, content_type='application/json')
    else:
        return HttpResponse(status=400)


@csrf_protect
@login_required()
def placemark_update(request):
    if request.is_ajax():
        name = request.POST.get('name', '')
        descr = request.POST.get('descr', '')
        id = request.POST.get('id', '')
        try:
            placemark = Placemark.objects.get(id=int(id))
        except Placemark.DoesNotExist:
            return HttpResponse(status=404)
        placemark.name = name
        placemark.descr = descr
        placemark.save()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)

@csrf_protect
@login_required()
def placemark_delete(request):
    if request.is_ajax():
        try:
            placemark = Placemark.objects.get(id=int(request.POST.get('id', ''))).delete()
        except Placemark.DoesNotExist:
            HttpResponse(status=404)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=400)

@login_required()
@csrf_exempt
def placemark_img_upload(request, *args, **kwargs):
        if request.is_ajax:
            if request.FILES.has_key('file') and request.POST.has_key('id_upload'):
                p = Placemark.objects.get(id=request.POST['id_upload'])
                p.img = request.FILES['file']
                p.save()
                json_response = json.dumps({"img_url": p.img.url})
                return HttpResponse(json_response, content_type='application/json')
            else:
                return HttpResponse(status=400)
        else:
            return HttpResponse(status=400)
