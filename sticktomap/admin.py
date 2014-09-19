from django.contrib import admin

from sticktomap.models import Placemark


class PlacemarkAdmin(admin.ModelAdmin):
    list_display = ('name', 'descr', 'lat', 'lon')
    
    def queryset(self, request):
        if request.user.is_superuser:
            return Placemark.objects.all()
        return Placemark.objects.filter(user=request.user)

admin.site.register(Placemark, PlacemarkAdmin)
