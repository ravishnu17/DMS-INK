# test_db_connection.py
import pytest
from models.category import Category
from testcase.conftest import TestingSessionLocal

@pytest.mark.usefixtures("db")
def test_db_connection(db):
    # Test if the database is accessible and inserting works
    new_category = Category(name="Test Category",province_id=1,type="Month",is_renewal=False,renewal_iteration=1,is_due=False)
    db.add(new_category)
    db.commit()

    # Verify that the category was added
    saved_category = db.query(Category).filter_by(name="Test Category").first()
    assert saved_category is not None, "Category should be created successfully!"
    assert saved_category.name == "Test Category", "Category name should match!"
