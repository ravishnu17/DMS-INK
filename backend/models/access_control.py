from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, BigInteger, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from settings.db_base import Base
from settings.utils.audit_mixin import AuditMixin

# meta data without foreign key
class MetaData(Base):
    __abstract__ = True
    
    active= Column(Boolean, nullable=False, server_default='True')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by= Column(Integer, nullable=True)
    updated_at= Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    updated_by= Column(Integer, nullable=True)

# meta data with foreign key
class BaseModel(Base):
    __abstract__ = True

    active= Column(Boolean, nullable=False, server_default='True')
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_by= Column(Integer, ForeignKey("tbl_user.id", ondelete="SET NULL"), nullable=True, index= True)
    updated_at= Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    updated_by= Column(Integer, ForeignKey("tbl_user.id", ondelete="SET NULL"), nullable=True, index= True)


# role module features
class Role(BaseModel):
    __tablename__ = 'tbl_role'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    is_default = Column(Boolean, nullable=False, server_default='False')


# user
class User(MetaData,AuditMixin):
    __tablename__ = 'tbl_user'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    role_id = Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=True, index=True)
    name = Column(String(250), nullable=False, index=True)
    email = Column(String(250), nullable=False, index=True)
    mobile_no = Column(String(32), nullable=True, index=True)
    mobile_country_code = Column(String(8), nullable=True)
    whatsapp_no = Column(String(32), nullable=True)
    whatsapp_country_code = Column(String(8), nullable=True)
    dob = Column(Date, nullable=True)
    gender = Column(String(50), nullable=True, index=True)
    designation = Column(String(250), nullable=True)
    profile_pic = Column(String(250), nullable=True)
    username = Column(String(150), nullable=False, index=True)
    password = Column(String, nullable=False)
    forgot_pin = Column(Integer, nullable=True)
    pin_expiration = Column(DateTime, nullable=True)
    resign= Column(Boolean, nullable=False, server_default='False')
    resign_reason = Column(String(100), nullable=True)
    
    role= relationship("Role", foreign_keys=[role_id])
    province= relationship("Province", foreign_keys=[province_id])
    tbl_notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
class Module(BaseModel):
    __tablename__ = 'tbl_module'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
class Feature(BaseModel):
    __tablename__ = 'tbl_feature'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)

class ModuleFeature(BaseModel):
    __tablename__ = 'tbl_module_feature'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    module_id = Column(Integer, ForeignKey('tbl_module.id', ondelete='CASCADE'), nullable=False, index=True)
    feature_id = Column(Integer, ForeignKey('tbl_feature.id', ondelete='CASCADE'), nullable=False, index=True)

    module= relationship("Module", foreign_keys=[module_id])
    feature= relationship("Feature", foreign_keys=[feature_id])

class RoleModuleFeature(BaseModel):
    __tablename__ = 'tbl_role_module_feature'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    role_id = Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)
    module_feature_id = Column(Integer, ForeignKey('tbl_module_feature.id', ondelete='CASCADE'), nullable=False, index=True)
    status = Column(Boolean, nullable=False, server_default='False')

    role= relationship("Role", foreign_keys=[role_id])
    module_feature= relationship("ModuleFeature", foreign_keys=[module_feature_id])

# location tables
class Country(BaseModel):
    __tablename__ = 'tbl_country'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)

class State(BaseModel):
    __tablename__ = 'tbl_state'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)

class Region(BaseModel):
    __tablename__ = 'tbl_region'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)

class District(BaseModel):
    __tablename__ = 'tbl_district'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=True, index=True)
# province
class Province(BaseModel):
    __tablename__ = 'tbl_province'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    code = Column(String(100), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    logo = Column(String, nullable=True)
    place = Column(String(150), nullable=False, index=True)

    address = Column(String(250), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey('tbl_district.id', ondelete='CASCADE'), nullable=False, index=True)

    country_ids = Column(String(150), nullable=True)
    state_ids = Column(String(150), nullable=True)
    region_ids = Column(String(150), nullable=True)
    district_ids = Column(String(150), nullable=True)

    country = relationship("Country")
    state = relationship("State")
    region = relationship("Region")
    district = relationship("District")
    
    
