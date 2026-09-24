import base64
import hashlib
import hmac
import time

from fastapi import HTTPException, status

from app.core.config import get_settings


def _sign(payload: str) -> str:
    secret = get_settings().auth_secret.encode('utf-8')
    return hmac.new(secret, payload.encode('utf-8'), hashlib.sha256).hexdigest()


def create_token(username: str, role: str, ttl_seconds: int = 60 * 60 * 12) -> str:
    expires_at = int(time.time()) + ttl_seconds
    payload = f'{username}:{role}:{expires_at}'
    token = f'{payload}:{_sign(payload)}'
    return base64.urlsafe_b64encode(token.encode('utf-8')).decode('utf-8')


def decode_token(token: str) -> dict[str, str]:
    try:
        raw = base64.urlsafe_b64decode(token.encode('utf-8')).decode('utf-8')
        username, role, expires_at, signature = raw.split(':', 3)
        payload = f'{username}:{role}:{expires_at}'
    except Exception as exc:  # pragma: no cover - defensive parsing
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token') from exc

    if not hmac.compare_digest(signature, _sign(payload)):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token signature')
    if int(expires_at) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token expired')
    return {'username': username, 'role': role}
