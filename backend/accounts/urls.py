from django.urls import path
from .views import (
    RegisterView, LoginView, CurrentUserView,
    UserListView, UserDetailView,
    PermissionListView, SetUserPermissions,
)

urlpatterns = [
    path("register/",                       RegisterView.as_view(),       name="register"),
    path("login/",                          LoginView.as_view(),          name="login"),
    path("me/",                             CurrentUserView.as_view(),    name="me"),
    path("users/",                          UserListView.as_view(),       name="users-list"),
    path("users/<int:pk>/",                 UserDetailView.as_view(),     name="user-detail"),
    path("permissions/",                    PermissionListView.as_view(), name="permissions-list"),
    path("users/<int:pk>/set-permissions/", SetUserPermissions.as_view(), name="user-set-permissions"),
]