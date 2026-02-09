import copy
from django.template import context

def fixed_base_context_copy(self):
    """
    Monkeypatch for BaseContext.__copy__ to fix compatibility with Python 3.14+
    where copy(super()) returns a read-only object instance causing AttributeError.
    """
    # Create new instance without calling __init__
    duplicate = self.__class__.__new__(self.__class__)
    
    # Copy all attributes (shallow copy)
    # This ensures that attributes like 'template', 'render_context' (from Context/RequestContext) are preserved
    duplicate.__dict__ = self.__dict__.copy()
    
    # Specific behavior for 'dicts': we want a shallow copy of the list itself
    # so that pushing/popping in the copy doesn't affect the original
    if hasattr(self, 'dicts'):
        duplicate.dicts = self.dicts[:]
        
    return duplicate

# Apply the patch
context.BaseContext.__copy__ = fixed_base_context_copy
print("Applied updated BaseContext.__copy__ monkeypatch for Python 3.14 compatibility.")
