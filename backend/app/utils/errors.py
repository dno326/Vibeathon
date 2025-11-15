class MountainMergeError(Exception):
    """Base exception for MountainMerge."""
    pass

class NotFoundError(MountainMergeError):
    """Resource not found."""
    pass

class UnauthorizedError(MountainMergeError):
    """Unauthorized access."""
    pass

class ValidationError(MountainMergeError):
    """Validation error."""
    pass

