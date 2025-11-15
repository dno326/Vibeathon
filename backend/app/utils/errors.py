class InSyncError(Exception):
    """Base exception for InSync."""
    pass

class NotFoundError(InSyncError):
    """Resource not found."""
    pass

class UnauthorizedError(InSyncError):
    """Unauthorized access."""
    pass

class ValidationError(InSyncError):
    """Validation error."""
    pass

