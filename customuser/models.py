# coding: utf-8
from django.db import models
from django.contrib.auth.models import AbstractUser

class UserProfile(AbstractUser):
    birthdate = models.DateField(null=True, verbose_name='Дата рождения')
    


