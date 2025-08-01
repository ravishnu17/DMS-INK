from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Float, Index, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .configuration import BaseModel, Base

# financial year model
class FinancialYear(BaseModel):
    __tablename__ = 'tbl_financial_year'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    year = Column(String(50), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

# data types for dynamic forms
class DataTypes(Base):
    __tablename__ = 'tbl_data_types'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    name = Column(String(50), nullable=False, index=True) # values = text, number, date, time, single choice, multi choice, image, file upload

# file types for file upload type
class FileTypes(Base):
    __tablename__ = 'tbl_file_types'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    data_type_id= Column(Integer, ForeignKey('tbl_data_types.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(50), nullable=False, index=True)

# category master data
class Category(BaseModel):
    __tablename__ = 'tbl_category'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    province_id = Column(Integer, ForeignKey('tbl_province.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(250), nullable=False, index=True)
    type = Column(String(250), nullable=True, index=True)
    is_renewal = Column(Boolean, nullable=False)
    renewal_iteration = Column(Integer, nullable=True)
    is_due = Column(Boolean, nullable=False)
    description = Column(String(250), nullable=True)

    category_form = relationship("CategoryForm", primaryjoin="and_(Category.id == CategoryForm.category_id, CategoryForm.active == True)", back_populates="category", order_by="CategoryForm.order.asc()")

# category financial dues map
class CategoryFinancialDueMap(BaseModel):
    __tablename__ = 'tbl_category_financial_year_due_map'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('tbl_category.id', ondelete='CASCADE'), nullable=False, index=True)
    financial_year_id = Column(Integer, ForeignKey('tbl_financial_year.id', ondelete='CASCADE'), nullable=False, index=True)
    due_day= Column(Integer, nullable=False)  #1-31
    due_month = Column(Integer, nullable=False) #1-12

    categrory = relationship("Category", backref="category_financial_due_map", foreign_keys=[category_id])
    financial_year = relationship("FinancialYear", backref="category_financial_due_map", foreign_keys=[financial_year_id])

# category form design
class CategoryForm(BaseModel):
    __tablename__ = 'tbl_category_form'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('tbl_category.id', ondelete='CASCADE'), nullable=False, index=True)
    data_type_id = Column(Integer, ForeignKey('tbl_data_types.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(250), nullable=False, index=True)
    placeholder = Column(String(250), nullable=False)
    required = Column(Boolean, nullable=False)
    regex = Column(String(250), nullable=True) # only text
    regex_error_msg = Column(String(250), nullable=True) # only text
    max_length = Column(Integer, nullable=True) # only text
    allow_decimal = Column(Boolean, nullable=True) # only number
    max_file_size = Column(Float, nullable=True) # only image, file upload in mb
    allow_past_date = Column(Boolean, nullable=True)
    allow_future_date = Column(Boolean, nullable=True)
    time_format_24 = Column(Boolean, nullable= True)
    date_format = Column(String, nullable= True)
    order = Column(Integer, nullable=False)

    category = relationship("Category", back_populates="category_form", foreign_keys=[category_id])
    data_type = relationship("DataTypes", backref="category_form", foreign_keys=[data_type_id])

# single or multi select options
class CategoryFormOptions(BaseModel):
    __tablename__ = 'tbl_category_form_options'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    category_form_id = Column(Integer, ForeignKey('tbl_category_form.id', ondelete='CASCADE'), nullable=False, index=True)
    value = Column(String(250), nullable=False, index=True)
    default_select = Column(Boolean, nullable=False, server_default="False")
    order = Column(Integer, nullable=False)

    category_form = relationship("CategoryForm", backref="category_form_options", foreign_keys=[category_form_id])

# category form file type
class CategoryFormFileTypeMap(BaseModel):
    __tablename__ = 'tbl_category_form_file_type_map'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    category_form_id = Column(Integer, ForeignKey('tbl_category_form.id', ondelete='CASCADE'), nullable=False, index=True)
    file_type_id = Column(Integer, ForeignKey('tbl_file_types.id', ondelete='CASCADE'), nullable=False, index=True)

    category_form = relationship("CategoryForm", backref="category_form_file_type_map", foreign_keys=[category_form_id])
    file_type = relationship("FileTypes", backref="category_form_file_type_map", foreign_keys=[file_type_id])

# portfolio category mapp
class PortfolioCategoryMap(BaseModel):
    __tablename__ = 'tbl_portfolio_category_map'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    portfolio_id = Column(Integer, ForeignKey('tbl_portfolio.id', ondelete='CASCADE'), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('tbl_category.id', ondelete='CASCADE'), nullable=False, index=True)

    portfolio = relationship("Portfolio", backref="portfolio_category_map", foreign_keys=[portfolio_id])
    category = relationship("Category", backref="portfolio_category_map", foreign_keys=[category_id])
