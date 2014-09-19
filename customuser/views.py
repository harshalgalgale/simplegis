from registration.backends.default.views import RegistrationView
from django.views.generic.edit import UpdateView
from registration import signals
from registration.models import RegistrationProfile
from django.contrib.sites.models import Site
from django.contrib.sites.models import RequestSite
from .models import UserProfile
from .forms import UserProfileUpdateForm


class CustomRegistrationView(RegistrationView):
    """
    Needed override this django-registration feature to have it create
    a profile with extra fields
    """
    def register(self, request, **cleaned_data):
        username, email, password, birthdate = cleaned_data['username'], cleaned_data['email'], cleaned_data['password1'], cleaned_data['birthdate']
        if Site._meta.installed:
            site = Site.objects.get_current()
        else:
            site = RequestSite(request)
        new_user = RegistrationProfile.objects.create_inactive_user(
            username, email, password, birthdate, site)
        signals.user_registered.send(sender=self.__class__,
                                     user=new_user,
                                     request=request)
        return new_user



class CustomUpdateView(UpdateView):
    form_class = UserProfileUpdateForm
    model = UserProfile
    template_name = 'registration/profile.html'
    success_url = '/accounts/profile'

    def get_object(self, queryset=None):
        return self.request.user

    def get(self, request, **kwargs):
        self.object = UserProfile.objects.get(username=self.request.user)
        form_class = self.get_form_class()
        form = self.get_form(form_class)
        context = self.get_context_data(object=self.object, form=form)
        return self.render_to_response(context)
    '''
    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.user = self.request.user
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())
    '''