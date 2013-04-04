from django.db import models

# Create your models here.

class Stick(models.Model):
    name = models.CharField(max_length=100)
    desc = models.CharField(max_length=300)
    lat = models.FloatField(('Latitude'), blank=True, null=True)
    lon = models.FloatField(('Longitude'), blank=True, null=True)

