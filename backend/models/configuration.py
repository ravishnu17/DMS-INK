from sqlalchemy import Column, Integer, String, Boolean, ForeignKey,DateTime
from sqlalchemy.orm import relationship,backref
from .access_control import  BaseModel, Base
from settings.utils.audit_mixin import AuditMixin

class Portfolio(BaseModel):
    __tablename__ = 'tbl_portfolio'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    type = Column(String(100), nullable=False) # Financial, Non-Financial

    # users = relationship("PortfolioUser", back_populates="portfolio", foreign_keys=[PortfolioUser.portfolio_id])

class FinancialPortfolioMap(BaseModel):
    __tablename__ = 'tbl_portfolio_financial_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    non_financial_portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id'), nullable=False, index=True)
    financial_portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id'), nullable=False, index=True)

    non_financial_name= relationship("Portfolio", foreign_keys=[non_financial_portfolio_id])
    financial_name= relationship("Portfolio", foreign_keys=[financial_portfolio_id])





class Community(BaseModel, AuditMixin):
    __tablename__ = 'tbl_community'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    code = Column(String(100), nullable=False, index=True)
    acme_code = Column(String(50), nullable=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    place = Column(String(150), nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=True, index=True)

    address = Column(String(250), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey('tbl_district.id', ondelete='CASCADE'), nullable=False, index=True)

    province = relationship("Province")
    country = relationship("Country")
    state = relationship("State")
    district = relationship("District")
    region = relationship("Region")
    portfolio = relationship("Portfolio")

    # Cascade delete related CommunityUser and CFP records
    community_user = relationship(
        "CommunityUser",
        backref=backref("community", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    cfp_data = relationship(
        "CFP",
        backref=backref("community", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    @property
    def cfp(self):
        return sorted(self.cfp_data, key=lambda c: c.portfolio.name if c.portfolio else "")

class CommunityUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_community_map'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    community_id = Column(Integer, ForeignKey('tbl_community.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])


class CFP(BaseModel, AuditMixin):
    __tablename__ = 'tbl_CFP'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=False, index=True)
    community_id = Column(Integer, ForeignKey('tbl_community.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(150), nullable=True)
    number = Column(String(150), nullable=True, index=True)
    type = Column(String(100), nullable=True, index=True)
    # community = relationship("Community", backref="cfp_data", foreign_keys=[community_id])
    portfolio = relationship("Portfolio", foreign_keys=[portfolio_id])

class CFPUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_CFP_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    cfp_id = Column(Integer, ForeignKey('tbl_CFP.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id= Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)

    cfp = relationship("CFP", backref="cfp_user", foreign_keys=[cfp_id])
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])

# Society
class Society(BaseModel, AuditMixin):
    __tablename__ = 'tbl_society'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    community_id = Column(Integer, ForeignKey('tbl_community.id', ondelete='CASCADE'), nullable=False, index=True)
    code = Column(String(100), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    place = Column(String(150), nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=True, index=True)

    address = Column(String(250), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey('tbl_district.id', ondelete='CASCADE'), nullable=False, index=True)

    community = relationship("Community", backref="society", foreign_keys=[community_id])
    province = relationship("Province")
    country = relationship("Country")
    state = relationship("State")
    region = relationship("Region")
    district = relationship("District")
    portfolio = relationship("Portfolio")

    society_user = relationship(
        "SocietyUser",
        backref=backref("society", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    sfp_data = relationship(
        "SFP",
        backref=backref("society", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    @property
    def sfp(self):
        return sorted(self.sfp_data, key=lambda c: c.portfolio.name if c.portfolio else "")
class SocietyUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_society_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    society_id = Column(Integer, ForeignKey('tbl_society.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id= Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # society = relationship("Society", backref="society_user", foreign_keys=[society_id])
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])

# Society financial portfolio
class SFP(BaseModel, AuditMixin):
    __tablename__ = 'tbl_SFP'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=False, index=True)
    society_id = Column(Integer, ForeignKey('tbl_society.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(150), nullable=True)
    number = Column(String(150), nullable=True, index=True)
    type = Column(String(100), nullable=True, index=True)
    # society = relationship("Society", backref="sfp_data", foreign_keys=[society_id])
    portfolio = relationship("Portfolio", foreign_keys=[portfolio_id])


class SFPUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_SFP_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    sfp_id = Column(Integer, ForeignKey('tbl_SFP.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id= Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)

    sfp = relationship("SFP", backref="sfp_user", foreign_keys=[sfp_id])
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])

class LegalEntity(BaseModel, AuditMixin):
    __tablename__ = 'tbl_legal_entity'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    community_id = Column(Integer, ForeignKey('tbl_community.id', ondelete='CASCADE'), nullable=False, index=True)
    society_id = Column(Integer, ForeignKey('tbl_society.id', ondelete='CASCADE'), nullable=True, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=False, index=True)
    diocese_id = Column(Integer, ForeignKey('tbl_diocese.id', name='fk_tbl_legal_entity_tbl_diocese', ondelete='CASCADE'), nullable=True, index=True)
    code = Column(String(100), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    type = Column(String(150), nullable=True, index=True) # tech ins, board/hostel
    financial_assistance = Column(String(100), nullable=True, index=True)
    board = Column(String(100), nullable=True) # tech board
    affiliation = Column(String(100), nullable=True)
    faculty = Column(String(100), nullable=True)
    ug_pg = Column(String(100), nullable=True)
    school_board = Column(String(100), nullable=True)
    medium_of_instruction = Column(String(100), nullable=True)
    grade = Column(String(100), nullable=True)

    place = Column(String(150), nullable=False, index=True)
    address = Column(String(250), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey('tbl_district.id', ondelete='CASCADE'), nullable=False, index=True)

    province = relationship("Province")
    community= relationship("Community", backref="legal_entity", foreign_keys=[community_id])
    society= relationship("Society", backref="legal_entity", foreign_keys=[society_id])
    diocese= relationship("Diocese")

    country = relationship("Country")
    state = relationship("State")
    region = relationship("Region")
    district = relationship("District")

    portfolio = relationship("Portfolio", backref="legal_entity", foreign_keys=[portfolio_id])
    
    lefp_data = relationship(
        "LEFP",
        backref=backref("legal_entity", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    entity_user = relationship(
        "LegalEntityUser",
        backref=backref("legal_entity", passive_deletes=True),
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    
    @property
    def lefp(self):
        return sorted(self.lefp_data, key=lambda c: c.portfolio.name if c.portfolio else "")

class LegalEntityUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_legal_entity_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    legal_entity_id = Column(Integer, ForeignKey('tbl_legal_entity.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id= Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)

    # legal_entity = relationship("LegalEntity", backref="entity_user", foreign_keys=[legal_entity_id])
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])

# Legal entity financial portfolio
class LEFP(BaseModel, AuditMixin):
    __tablename__ = 'tbl_LEFP'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=False, index=True)
    legal_entity_id = Column(Integer, ForeignKey('tbl_legal_entity.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(150), nullable=True)
    number = Column(String(150), nullable=True, index=True)
    type = Column(String(100), nullable=True, index=True)
    # legal_entity = relationship("LegalEntity", backref="lefp_data", foreign_keys=[legal_entity_id])
    portfolio = relationship("Portfolio", foreign_keys=[portfolio_id])


class LEFPUser(BaseModel, AuditMixin):
    __tablename__ = 'tbl_user_LEFP_map'

    id = Column(Integer, primary_key=True, autoincrement= True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('tbl_user.id', ondelete='CASCADE'), nullable=False, index=True)
    lefp_id = Column(Integer, ForeignKey('tbl_LEFP.id', ondelete='CASCADE'), nullable=False, index=True)
    role_id= Column(Integer, ForeignKey('tbl_role.id', ondelete='CASCADE'), nullable=False, index=True)

    lefp = relationship("LEFP", backref="lefp_user", foreign_keys=[lefp_id])
    user = relationship("User", foreign_keys=[user_id])
    role = relationship("Role", foreign_keys=[role_id])

#Create the Diocese Model
class Diocese(BaseModel, AuditMixin):
    __tablename__ = 'tbl_diocese'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    code = Column(String(100), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    place = Column(String(150), nullable=False, index=True)
    address = Column(String(150), nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey('tbl_region.id', ondelete='CASCADE'), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey('tbl_district.id', ondelete='CASCADE'), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey('tbl_state.id', ondelete='CASCADE'), nullable=False, index=True)
    country_id = Column(Integer, ForeignKey('tbl_country.id', ondelete='CASCADE'), nullable=False, index=True)
  

    province = relationship("Province")
    region = relationship("Region")
    district = relationship("District")
    state = relationship("State")
    country = relationship("Country")