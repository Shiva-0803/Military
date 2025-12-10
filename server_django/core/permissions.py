from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'ADMIN'

class IsCommander(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'BASE_COMMANDER'

class IsLogistics(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'LOGISTICS_OFFICER'
