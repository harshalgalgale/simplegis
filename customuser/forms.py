from registration.forms import RegistrationFormUniqueEmail
from django import forms
from django.forms import ModelForm
from django.forms.extras.widgets import SelectDateWidget
from .models import UserProfile
import datetime
now = datetime.datetime.now()


class UserProfileForm(forms.ModelForm):
    """
    Get extra fields to add to form for django-registration
    """
    class Meta:
        model = UserProfile
        fields = ('birthdate',)

    birthdate = forms.DateField(widget = SelectDateWidget(years = range(now.year, now.year-100, -1)))


class UserProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('email', 'birthdate',)

    birthdate = forms.DateField(widget = SelectDateWidget(years = range(now.year, now.year-100, -1)))

RegistrationFormUniqueEmail.base_fields.update(UserProfileForm.base_fields)