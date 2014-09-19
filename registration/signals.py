from django.dispatch import Signal
from django.contrib.sites.models import Site, RequestSite
from .models import UserProfile as User
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from registration.models import RegistrationProfile


# A new user has registered.
user_registered = Signal(providing_args=["user", "request"])

# A user has activated his or her account.
user_activated = Signal(providing_args=["user", "request"])



# Check if email change
@receiver(pre_save,sender=User)
def pre_check_email(sender, instance, **kw):
    if instance.id:
        _old_email = instance._old_email = sender.objects.get(id=instance.id).email
        if _old_email != instance.email:
            instance.is_active = False

@receiver(post_save,sender=User)
def post_check_email(sender, instance, created, **kw):
    if not created:
        _old_email = getattr(instance, '_old_email', None)
        if instance.email != _old_email:
            # remove registration profile
            try:
                old_profile = RegistrationProfile.objects.get(user=instance)
                old_profile.delete()
            except:
                pass

            # create registration profile
            new_profile = RegistrationProfile.objects.create_profile(instance)

            # send activation email
            if Site._meta.installed:
                site = Site.objects.get_current()
            else:
                site = RequestSite(request)
            new_profile.send_activation_email(site) 
