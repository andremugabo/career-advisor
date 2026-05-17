from django.contrib import admin
from django.contrib.auth.models import Group
from apps.users.models import User

# Unregister default Group model if not strictly needed in the UI, to keep the panel super clean
# admin.site.unregister(Group)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role', 'is_active', 'is_staff', 'mfa_enabled', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'mfa_enabled')
    search_fields = ('email',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Account Credentials', {
            'fields': ('email', 'password')
        }),
        ('Access & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Security Settings', {
            'fields': ('mfa_enabled',)
        }),
        ('Audit Trail', {
            'fields': ('created_from_ip', 'modified_from_ip')
        }),
    )
    
    # Secure audit fields from being manually edited by rogue admins
    readonly_fields = ('created_from_ip', 'modified_from_ip')
    
    def save_model(self, request, obj, form, change):
        """
        Ensures passwords are securely hashed if an admin manually changes them via the UI.
        """
        if obj.pk:
            orig_obj = User.objects.get(pk=obj.pk)
            if obj.password != orig_obj.password:
                obj.set_password(obj.password)
        else:
            obj.set_password(obj.password)
        super().save_model(request, obj, form, change)
