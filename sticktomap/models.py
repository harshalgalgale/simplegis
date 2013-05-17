from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Placemark(models.Model):
    name = models.CharField(('Name'),max_length=100)
    descr = models.CharField(('Description'),max_length=500)
    lat = models.FloatField(('Latitude'))
    lon = models.FloatField(('Longitude'))
    user = models.ForeignKey(User, related_name='placemarks')
    def __unicode__(self):
        return u'%s (%.4f, %.4f)' % (self.name, self.lat, self.lon)
