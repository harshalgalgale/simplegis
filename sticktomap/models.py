from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Placemark(models.Model):
    name = models.CharField(max_length=100)
    desc = models.CharField(max_length=300)
    lat = models.FloatField(('Latitude'), blank=True, null=True)
    lon = models.FloatField(('Longitude'), blank=True, null=True)
    user = models.ForeignKey(User, related_name='placemarks')
