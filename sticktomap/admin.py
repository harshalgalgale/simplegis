from django.contrib import admin

from sticktomap.models import Placemark


class PlacemarkAdmin(admin.ModelAdmin):
    #exclude = ('user',)
    list_display = ('name', 'desc', 'lat', 'lon')
    #prepopulated_fields = { 'slug': ['name'] }
    
    

    def queryset(self, request):
        if request.user.is_superuser:
            return Placemark.objects.all()
        return Placemark.objects.filter(user=request.user)

admin.site.register(Placemark, PlacemarkAdmin)
