from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Float, Index, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .weblinks import BaseModel, Base

# Answer table
class Answer(BaseModel):
    __tablename__ = 'tbl_answer'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    
    community_id = Column(Integer, ForeignKey('tbl_community.id', ondelete="CASCADE"), nullable=True, index=True)
    cfp_id = Column(Integer, ForeignKey('tbl_CFP.id', ondelete="CASCADE"), nullable=True, index=True)
    
    society_id = Column(Integer, ForeignKey('tbl_society.id', ondelete="CASCADE"), nullable=True, index=True)
    sfp_id = Column(Integer, ForeignKey('tbl_SFP.id', ondelete="CASCADE"), nullable=True, index=True)
    
    legal_entity_id = Column(Integer, ForeignKey('tbl_legal_entity.id', ondelete="CASCADE"), nullable=True, index=True)
    lefp_id = Column(Integer, ForeignKey('tbl_LEFP.id', ondelete="CASCADE"), nullable=True, index=True)
    
    category_id = Column(Integer, ForeignKey('tbl_category.id', ondelete="CASCADE"), nullable=False, index=True)

    community = relationship("Community", backref="community_answer", foreign_keys=[community_id])
    cfp = relationship("CFP", backref="community_answer", foreign_keys=[cfp_id])
    
    society = relationship("Society", backref="community_answer", foreign_keys=[society_id])
    sfp = relationship("SFP", backref="community_answer", foreign_keys=[sfp_id])

    legal_entity = relationship("LegalEntity", backref="community_answer", foreign_keys=[legal_entity_id])
    lefp = relationship("LEFP", backref="community_answer", foreign_keys=[lefp_id])
    
    category = relationship("Category", backref="community_answer", foreign_keys=[category_id])

class AnswerData(BaseModel):
    __tablename__ = 'tbl_answer_data'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, index=True)
    answer_id = Column(Integer, ForeignKey('tbl_answer.id', ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    financial_year = Column(Integer, ForeignKey('tbl_financial_year.id', name="fk_tbl_answer_data_tbl_financial_year", ondelete="CASCADE"), nullable=False, index=True)
    start_date = Column(Date, nullable=True, index=True)
    end_date = Column(Date, nullable=True, index=True)

    answer_data = Column(JSONB, nullable=False)

    __table_args__ = (
        # Index for efficient JSONB queries
        Index('idx_answer_data_gin', answer_data, postgresql_using='gin'),
        # Example: Indexing a specific key inside JSONB
        # Index('idx_answer_data_category', text("(answer_data->>'category_id')"), postgresql_using='btree')
    )

    answer = relationship("Answer", backref="answer_data", foreign_keys=[answer_id])
    financial_year_data = relationship("FinancialYear", backref="community_answer", foreign_keys=[financial_year])