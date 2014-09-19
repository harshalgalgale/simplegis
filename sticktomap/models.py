# -*- coding: utf-8 -*-

import os
from django import forms
from django.db import models
from customuser.models import UserProfile


# Create your models here.

class Placemark(models.Model):
    name = models.CharField(('Name'), max_length=100)
    descr = models.CharField(('Description'), max_length=500)
    img = models.ImageField(('Image'), upload_to='img/%Y/%m/%d', blank=True)
    lat = models.FloatField(('Latitude'))
    lon = models.FloatField(('Longitude'))
    user = models.ForeignKey(UserProfile, related_name='placemarks')
    def __unicode__(self):
        return u'%s (%.4f, %.4f)' % (self.name, self.lat, self.lon)


class Track(models.Model):
    name = models.CharField(('Name'), max_length=100)
    descr = models.CharField(('Description'), max_length=500, blank=True)
    color = models.CharField(('Color'), max_length=7, default='#000000')
    track = models.TextField()
    user = models.ForeignKey(UserProfile, related_name='tracks')
    def __unicode__(self):
        return u'%s' % (self.name)
