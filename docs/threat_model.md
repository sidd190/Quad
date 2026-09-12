What are we working on?
A central identity provider service for student built tools across campus.
The workflow is ---> email otp/manual id review -> campus auth provider -> vouching identity/2fa recovery -> login happens and the related student data is provided by the provider as needed

what can go wrong?
People can pose as other students. False reviews can be done, client app can be compromised, a stolen college email even?

what can we do about it
- have trust boundaries
    keycloak -> verifciation service -> client apps.
    Reviewer -> admin panel, student -> otp
- use various auth protocols and security techniques like pkce


did we do a good job