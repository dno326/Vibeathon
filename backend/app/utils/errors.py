class MountainMergeError(Exception):
    """Base exception for MountainMerge."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundError(MountainMergeError):
    """Resource not found."""
    def __init__(self, message: str = "Resource not found", status_code: int = 404):
        super().__init__(message, status_code)

class UnauthorizedError(MountainMergeError):
    """Unauthorized access."""
    def __init__(self, message: str = "Unauthorized", status_code: int = 401):
        super().__init__(message, status_code)

class ValidationError(MountainMergeError):
    """Validation error."""
    def __init__(self, message: str = "Validation error", status_code: int = 400):
        super().__init__(message, status_code)

