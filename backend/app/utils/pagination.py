from typing import List, Dict, Any

def paginate(items: List[Any], page: int = 1, page_size: int = 20) -> Dict[str, Any]:
    """Paginate a list of items."""
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = items[start:end]
    
    return {
        'data': paginated_items,
        'total': len(items),
        'page': page,
        'page_size': page_size,
        'total_pages': (len(items) + page_size - 1) // page_size
    }

