from functools import wraps
from flask import request, jsonify
from src.services.firebase_service import firebase_service

def require_auth(f):
    """
    Decorator to require Firebase authentication for routes
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header is required'}), 401
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header must start with Bearer'}), 401
        
        # Extract the token
        id_token = auth_header.split('Bearer ')[1]
        
        # Verify the token
        decoded_token = firebase_service.verify_token(id_token)
        
        if not decoded_token:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user info to request context
        request.user_id = decoded_token['uid']
        request.user_email = decoded_token.get('email')
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """
    Get current user from request context
    Returns user_id if authenticated, None otherwise
    """
    return getattr(request, 'user_id', None)

