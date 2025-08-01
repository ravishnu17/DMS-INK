from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from models.notification import Base

class Log(Base):
    __tablename__ = "tbl_audit_log"

    log_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=True, index=True)
    # module_name community, society, legal_entity, lefp, user, category, etc ...
    module_name = Column(String, nullable=False, index=True) # like table name with prefix tbl_
    record_id = Column(Integer, nullable=False, index=True)
    record_title = Column(String, nullable=True, index=True)
    modification_type = Column(String, nullable=False, index=True) # Insert, Update, Delete
    old_value = Column(JSONB, nullable=True, index=True)
    new_value = Column(JSONB, nullable=True, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', name='fk_tbl_audit_log_tbl_user', ondelete='SET NULL'), nullable=True, index=True)
    user_name = Column(String, nullable=True, index=True)
    datetime = Column(DateTime(timezone=True), nullable=False, server_default=func.now())