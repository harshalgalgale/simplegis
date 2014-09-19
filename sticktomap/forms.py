from django import forms
from django.contrib.auth.forms import UserChangeForm

class UploadImageForm(forms.Form):
    image = forms.ImageField()
