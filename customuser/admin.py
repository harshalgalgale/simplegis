from django.contrib import admin
from django.contrib.auth.admin import UserAdmin    
from django.contrib.auth.models import User
from customuser.models import UserProfile

#admin.site.unregister(User)

class UserProfileInline(admin.StackedInline):
    model = UserProfile

class UserProfileAdmin(UserAdmin):
    inlines = [ UserProfileInline, ]
    list_display = ('username', 'email', 'is_staff','is_active',)
    list_filter = ('is_staff', 'is_superuser', 'is_active',) 
admin.site.register(User, UserProfileAdmin)