# imports for audit
from sqlalchemy import event

from settings.utils.audit_mixin import AuditMixin
from sqlalchemy.inspection import inspect

from models.access_control import District, State, Province, Country, Region,Role
from models.configuration import Portfolio, Community , Society, Diocese , LegalEntity

# imports for model to dict
from datetime import datetime, date
from sqlalchemy.orm import Session


# imports for user 
from contextvars import ContextVar
from typing import Optional
from schemas.access_control import Token  # Adjust import based on your actual Token model
from settings.config import secret  # Add this import at the top

# ===================================================================================
# region User Get & Set
current_user: ContextVar[Optional[Token]] = ContextVar('current_user', default=None)

def set_current_user(user: Token):
    current_user.set(user)

def get_current_user() -> Optional[Token]:
    return current_user.get()

# ===================================================================================
# region ids to name func
def get_district(db:Session, district_id):
    district = db.query(District).filter(District.id == district_id).first()
    if district is not None:
        return district
    else:
        return None

def get_state(db:Session, state_id):
    state = db.query(State).filter(State.id == state_id).first()
    if state is not None:
        return state
    else:
        return None

def get_province(db:Session, province_id):
    province = db.query(Province).filter(Province.id == province_id).first()
    if province is not None:
        return province
    else:
        return None
    
def get_country(db:Session, country_id):
    country = db.query(Country).filter(Country.id == country_id).first()
    if country is not None:
        return country
    else:
        return None

def get_region(db:Session, region_id):
    region = db.query(Region).filter(Region.id == region_id).first()
    if region is not None:
        return region
    else:
        return None

def get_portfolio(db:Session, portfolio_id):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if portfolio is not None:
        return portfolio
    else:
        return None
    
def get_society(db:Session, society_id):
    society = db.query(Society).filter(Society.id == society_id).first()
    if society is not None:
        return society
    else:
        return None

def get_community(db:Session, community_id):
    community = db.query(Community).filter(Community.id == community_id).first()
    if community is not None:
        return community
    else:
        return None

def get_legal_entity(db:Session, legal_entity_id):
    legal_entity = db.query(LegalEntity).filter(LegalEntity.id == legal_entity_id).first()
    if legal_entity is not None:
        return legal_entity
    else:
        return None
def get_diocese(db:Session, diocese_id):
    diocese = db.query(Diocese).filter(Diocese.id == diocese_id).first()
    if diocese is not None:
        return diocese
    else:
        return None

def get_role(db:Session, role_id):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is not None:
        return role
    else:
        return None

# ===================================================================================
# region Model to Dict 
def model_to_dict(instance, include_fk_names=True):
    """
    Convert a SQLAlchemy model instance to a dictionary.
    Automatically includes names of related objects for foreign keys.
    
    Args:
        instance: SQLAlchemy model instance
        include_fk_names: Whether to include foreign key names (defaults to True)
    
    Returns:
        Dictionary with model data and related names
    """
    if instance is None:
        return None
        
    # Get the database session from the instance
    db = inspect(instance).session
    
    result = {}
    for col in instance.__table__.columns:
        value = getattr(instance, col.name)
        
        # Handle datetime serialization
        if isinstance(value, (datetime, date)):
            result[col.name] = value.isoformat()
        else:
            result[col.name] = value

    # Handle foreign keys separately to ensure they're all processed
    if include_fk_names and db:
        if hasattr(instance, 'password'):
            result['password'] = '********'

        for attr in ['district_id', 
                     'state_id', 
                     'province_id', 
                     'country_id', 
                     'region_id', 
                     'portfolio_id', 
                     'community_id', 
                     'society_id', 
                     'legal_entity_id', 
                     'diocese_id',
                     'role_id']:
            if hasattr(instance, attr) and getattr(instance, attr):
                func = globals().get(f'get_{attr.split("_")[0]}')
                if func:
                    item = func(db, getattr(instance, attr))
                    if item and hasattr(item, 'name'):
                        result[f'{attr.split("_")[0]}_name'] = item.name
    return result

# ===================================================================================
# region Audit

FK_NAME_FUNCTIONS = {
    'district_id': get_district,
    'state_id': get_state,
    'province_id': get_province,
    'country_id': get_country,
    'region_id': get_region,
    'portfolio_id': get_portfolio,
    'community_id': get_community,
    'society_id': get_society,
    'legal_entity_id': get_legal_entity,
    'diocese_id': get_diocese,
    'role_id': get_role
}

def enrich_with_names(field, old_value, new_value, db):
    """Adds readable names for foreign keys and returns both the name field and whether it's a FK field."""
    name_key = field.replace("_id", "_name")
    get_func = FK_NAME_FUNCTIONS.get(field)
    old_name = new_name = None

    if get_func:
        if old_value:
            old_item = get_func(db, old_value)
            old_name = getattr(old_item, 'name', None) if old_item else None
        if new_value:
            new_item = get_func(db, new_value)
            new_name = getattr(new_item, 'name', None) if new_item else None

    return name_key, old_name, new_name, True 


def get_primary_key_value(obj):
    """Extract primary key value from an SQLAlchemy object."""
    pk = inspect(obj).identity
    return pk[0] if pk else None

def register_audit_events(Base, db_session):
    from models.audit import Log
    """Register audit events for models that inherit from AuditMixin."""
   
    
    # Get all model classes from SQLAlchemy's registry
    registry = Base.registry._class_registry
    
    # Track processed classes to avoid duplicate registrations
    processed_classes = set()
    
    for cls_name, cls in registry.items():
        # Skip non-class items and the Base class itself
        if not isinstance(cls, type) or cls is Base:
            continue
            
        # Skip abstract models and non-mapped classes
        if not hasattr(cls, '__table__') or cls.__table__ is None:
            continue
        
        # Skip the Log model itself to prevent recursion
        if cls.__name__ == 'Log':
            
            continue
            
        # Skip already processed classes
        if cls in processed_classes:
            
            continue
            
        # Check for AuditMixin presence
       
        
        if issubclass(cls, AuditMixin):
            
            
            # Mark this class as processed
            processed_classes.add(cls)
            
            # Create a dict to store original values for update operations
            update_original_values = {}
            
            # Use factory functions to properly capture class in closure
            def create_after_insert_listener(model_cls):
                @event.listens_for(model_cls, 'after_insert')
                def after_insert_handler(mapper, connection, target):
                    # Use a flag to prevent duplicate logging
                    if hasattr(target, '_already_logged_insert') and target._already_logged_insert:
                        return
                    target._already_logged_insert = True
                    
                    
                    
                    try:
                        record_id = get_primary_key_value(target)
                        
                        user = get_current_user()
                        
                        
                        if not user:
                            
                            return
                        
                        # Use the existing session instead of creating a new one
                        session = db_session.object_session(target)
                        if not session:
                            
                            return
                        
                        # Create the log entry
                        log = Log(
                            province_id=None if getattr(user, "user_id", None) == getattr(secret, "s_admin_role", None) else getattr(user, "province_id", None),
                            module_name=model_cls.__name__,
                            record_id=target.id,
                            record_title=target.get_audit_title() if hasattr(target, "get_audit_title") else str(record_id),
                            modification_type="Create",
                            old_value=None,
                            new_value=serialize_for_json(model_to_dict(target)),
                            user_id=getattr(user, "user_id", None),
                            user_name=getattr(user, "username", "system")
                        )
                        
                        # Add the log entry to the session
                        
                        session.add(log)
                        # Don't commit - the session will be committed when the original transaction completes
                        
                        
                    except Exception as e:
                        print(f"AUDIT ERROR: Failed to create insert log for {model_cls.__name__}: {str(e)}")
                
                return after_insert_handler
            
            # Capture before_update to store original values
            def create_before_update_listener(model_cls):
                @event.listens_for(model_cls, 'before_update')
                def before_update_handler(mapper, connection, target):
                    try:
                        record_id = get_primary_key_value(target)
                        if not record_id:
                            return

                        key = f"{model_cls.__name__}_{record_id}"
                        old_values = {}

                        state = inspect(target)
                        for attr in state.attrs:
                            if attr.history.has_changes():
                                old_values[attr.key] = attr.history.deleted[0] if attr.history.deleted else None

                        update_original_values[key] = old_values
                    except Exception as e:
                        print(f"AUDIT ERROR (Before Update): {model_cls.__name__} => {e}")
                return before_update_handler

            
            # Log after update to ensure the changes are persisted
            def create_after_update_listener(model_cls):
                @event.listens_for(model_cls, 'after_update')
                def after_update_handler(mapper, connection, target):
                    if hasattr(target, '_already_logged_update') and target._already_logged_update:
                        return
                    target._already_logged_update = True

                    try:
                        record_id = get_primary_key_value(target)
                        if not record_id:
                            return

                        user = get_current_user()
                        session = db_session.object_session(target)
                        db = inspect(target).session
                        key = f"{model_cls.__name__}_{record_id}"

                        old_values = update_original_values.get(key, {})
                        if not old_values:
                            return

                        enriched_old = {}
                        enriched_new = {}

                        for attr, old_val in old_values.items():
                            new_val = getattr(target, attr)
                            
                            # Handle foreign key fields
                            # Handle foreign key fields
                            if attr in FK_NAME_FUNCTIONS:
                                name_key, old_name, new_name, is_fk = enrich_with_names(attr, old_val, new_val, db)
                                enriched_old[name_key] = old_name
                                enriched_new[name_key] = new_name
                            elif attr == "password":
                                enriched_old[attr] = "**********"
                                enriched_new[attr] = "**********"
                            elif attr == "updated_by":
                                continue
                            else:
                                # Handle regular fields
                                enriched_old[attr] = old_val
                                enriched_new[attr] = new_val

 
                        log = Log(
                            province_id=None if getattr(user, "user_id", None) == getattr(secret, "s_admin_role", None) else getattr(user, "province_id", None),
                            module_name=model_cls.__name__,
                            record_id=record_id,
                            record_title=target.get_audit_title() if hasattr(target, "get_audit_title") else str(record_id),
                            modification_type="Update",
                            old_value=serialize_for_json(enriched_old),
                            new_value=serialize_for_json(enriched_new),
                            user_id=getattr(user, "user_id", None),
                            user_name=getattr(user, "username", "system")
                        )
                        session.add(log)

                        if key in update_original_values:
                            del update_original_values[key]

                    except Exception as e:
                        print(f"AUDIT ERROR (After Update): {model_cls.__name__} => {e}")
                return after_update_handler
            # Using after_delete instead of before_delete
            def create_before_delete_listener(model_cls):
                @event.listens_for(model_cls, 'before_delete')
                def before_delete_handler(mapper, connection, target):
                    # Use a flag to prevent duplicate logging
                    if hasattr(target, '_already_logged_delete') and target._already_logged_delete:
                        return
                    target._already_logged_delete = True
                    
                    
                    
                    try:
                        record_id = get_primary_key_value(target)
                        if not record_id:
                            return
                            
                        user = get_current_user()
                        if not user:
                           
                            return
                        
                        # Store the data that will be deleted
                        old_data = model_to_dict(target)
                        
                        # Use the session of the target object
                        session = db_session.object_session(target)
                        if not session:
                            
                            return
                        
                        # Create log entry with record title before deletion
                        record_title = target.get_audit_title() if hasattr(target, "get_audit_title") else str(record_id)
                        
                        log = Log(
                            province_id=None if getattr(user, "user_id", None) == getattr(secret, "s_admin_role", None) else getattr(user, "province_id", None),
                            module_name=model_cls.__name__,
                            record_id=record_id,
                            record_title=record_title,
                            modification_type="Delete",
                            old_value=serialize_for_json(old_data),
                            new_value=None,
                            user_id=getattr(user, "user_id", None),
                            user_name=getattr(user, "username", "system")
                        )
                        
                        # Add log entry to the session
                        session.add(log)
                        # Flush to ensure the log is written before the deletion completes
                        session.flush([log])
                        
                        
                    except Exception as e:
                        print(f"AUDIT ERROR: Failed to create delete log for {model_cls.__name__}: {str(e)}")
                
                return before_delete_handler
            
            # Register event listeners with proper factory functions
            create_after_insert_listener(cls)
            create_before_update_listener(cls)
            create_after_update_listener(cls)
            create_before_delete_listener(cls)
            
            

def serialize_for_json(obj):
    if isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(i) for i in obj]
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    else:
        return obj
            
            
