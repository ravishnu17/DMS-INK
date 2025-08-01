from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from settings.auth import verifyToken  # or wherever your `verifyToken` lives
from settings.utils.audit_events import set_current_user

class AuthContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Clear any existing context at start
        
        set_current_user(None)
        
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            try:
                token = token.replace("Bearer ", "")
                user = verifyToken(token)
                set_current_user(user)
            except Exception as e:
                print(f"🔐 Auth Error: {str(e)}")
                # Don't raise here to allow non-auth routes
        
        response = await call_next(request)
        
        # Clean up context
        set_current_user(None)
        return response