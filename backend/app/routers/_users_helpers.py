"""_users_helpers.py — RBAC/role helpers + temp password cho users router (tách <=250)."""
import secrets

from deepguard_db.app.db.models import User
from app.core.exceptions import forbidden

INVITATION_TTL_DAYS = 7
ADMIN_ROLES = {"admin", "sysadmin"}
ADMIN_PROTECTED_ROLES = {"compliance", "sysadmin"}
ROLE_LEVEL = {"viewer": 0, "developer": 1, "compliance": 2, "admin": 3, "sysadmin": 4}


def _level(role) -> int:
    return ROLE_LEVEL.get(role.value if hasattr(role, "value") else str(role), 0)


def _role_value(role) -> str:
    return role.value if hasattr(role, "value") else str(role)


def _can_manage(actor: User, target_role) -> bool:
    """actor có quyền sửa/xóa/reset user mang target_role không."""
    a = actor.role.value
    if a == "sysadmin":
        return True
    if a == "admin":
        return _role_value(target_role) not in ADMIN_PROTECTED_ROLES
    return False


def _can_assign(actor: User, role_value: str) -> bool:
    """actor có quyền gán/mời/tạo vai trò role_value không."""
    a = actor.role.value
    if a == "sysadmin":
        return True
    if a == "admin":
        return role_value not in ADMIN_PROTECTED_ROLES
    return False


def _require_admin(user: User):
    if user.role.value not in ADMIN_ROLES:
        raise forbidden("Admin role required")


def _gen_temp_password(n: int = 12) -> str:
    """Mật khẩu tạm mạnh, dễ copy (có đủ chữ thường/HOA/số)."""
    import string
    alphabet = string.ascii_letters + string.digits
    while True:
        pw = "".join(secrets.choice(alphabet) for _ in range(n))
        if any(c.islower() for c in pw) and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw):
            return pw
