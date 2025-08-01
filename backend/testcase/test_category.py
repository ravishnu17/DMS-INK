import pytest
from fastapi.testclient import TestClient
from main import app
from settings.db import get_db
from models.configuration import Diocese,Community
from models.access_control import User, Role, Province, Country, State, Region, District
from passlib.context import CryptContext
from testcase.conftest import db as test_db
from sqlalchemy import text
import uuid

client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Override FastAPI's get_db dependency to use the test DB session
@pytest.fixture(scope="function", autouse=True)
def override_get_db(test_db):
    def _override_get_db():
        yield test_db
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()

# Create required foreign key records and the test user
@pytest.fixture(autouse=True)
def create_test_user(test_db):
    # Create Province if not exists
    province = test_db.query(Province).filter_by(id=1).first()
    if not province:
        province = Province(id=1, name="Test Province",code="PRO0001",place="Place",address="address",country_id=1,state_id=4,region_id=1,district_id=1)  # Adjust fields based on actual model
        test_db.add(province)

    test_db.commit()

    # Clean up existing user if necessary
    test_user = test_db.query(User).filter(User.username == "ProvinceAdmin").first()
    if test_user:
        test_db.delete(test_user)
        test_db.commit()

    # Add new test user
    test_user = User(
        role_id=2,
        province_id=1,
        name="Test User",
        email="test@example.com",
        mobile_no='1234567890',
        username="ProvinceAdmin",
        password=pwd_context.hash("ProvinceAdmin")
    )
    test_db.add(test_user)
    test_db.commit()

# Helper to get a valid token
def get_auth_token():
    login_payload = {
        "username": "ProvinceAdmin",
        "password": "ProvinceAdmin"
    }
    response = client.post("/access/login", data=login_payload)
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def auth_headers():
    token = get_auth_token()
    return {"Authorization": f"Bearer {token}"}

# ------------------------
# CATEGORY CRUD TEST CASES
# ------------------------



def test_create_category(auth_headers):
    unique_name = f"New Category {uuid.uuid4().hex[:6]}"  # Short unique ID to avoid name conflict
    payload = {
        "name": unique_name,
        "type": "Text",
        "is_renewal": True,
        "renewal_iteration": 1,
        "is_due": True,
        "description": "Test Description"
    }
    response = client.post("/category", json=payload, headers=auth_headers)
    assert response.status_code == 200, f"Unexpected status: {response.json()}"
    data = response.json()
    assert data["details"] == "Category added successfully", f"Unexpected status: {response.json()}"
    return data["data"]["id"], unique_name  # Return both for possible debugging

def test_get_category(auth_headers):
    category_id, _ = test_create_category(auth_headers)
    response = client.get("/category", headers=auth_headers)
    assert response.status_code == 200, f"Unexpected status: {response.json()}"
    assert response.json()["details"] == "Categories fetched successfully", f"Unexpected status: {response.json()}"

def test_get_category_by_id(auth_headers):
    category_id, _ = test_create_category(auth_headers)
    response = client.get(f"/category/{category_id}", headers=auth_headers)
    assert response.status_code == 200, f"Unexpected status: {response.json()}"
    assert response.json()["status"] is True, f"Unexpected status: {response.json()}"
    assert response.json()["details"] == "Category fetched successfully", f"Unexpected status: {response.json()}"

def test_update_category(auth_headers):
    category_id, _ = test_create_category(auth_headers)
    update_payload = {
        "name": "Updated Name",
        "type": "Text",
        "is_renewal": True,
        "renewal_iteration": 3,
        "is_due": True,
        "description": "Updated Description"
    }

    response = client.put(f"/category/{category_id}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200, f"Unexpected status: {response.json()}"
    assert response.json()["status"] is True, f"Unexpected status: {response.json()}"
    assert response.json()["details"] == "Category updated successfully", f"Unexpected status: {response.json()}"

def test_delete_category(auth_headers):
    category_id, _ = test_create_category(auth_headers)
    response = client.delete(f"/category/{category_id}", headers=auth_headers)
    assert response.status_code == 200 , f"Unexpected status: {response.json()}"
    assert response.json()["status"] is True, f"Unexpected status: {response.json()}"
    assert response.json()["details"] == "Category deleted successfully", f"Unexpected status: {response.json()}"

# def test_create_community(auth_headers, test_db):
#     check_all_required_data(test_db)

#     data = {
#         "province_id": 1,
#         "code": "COM0172",  # Use a unique code
#         "name": "Test Community",  # Valid name string
#         "place": "Community Place",
#         "address": "123 Community St.",
#         "country_id": 1,
#         "state_id": 4,
#         "region_id": 1,
#         "district_id": 1,
#         "community_user": [],
#         "cfp": []
#     }
    


#     response = client.post("/config/community", json=data, headers=auth_headers)
#     json_resp = response.json()

#     print("DEBUG:", json_resp)
#     assert json_resp["status"] is True, f"Unexpected response: {json_resp}"





# # Utility to check required model records
# def check_all_required_data(test_db):
#     required_models = [
#         ("Province", Province),
#         ("Role", Role),
#         ("Country", Country),
#         ("Diocese", Diocese),
#         ("State",State),
#         ("Region",Region),
#         ("District",District),
#         ("COmmunity",Community)
#     ]

#     for name, model in required_models:
#         count = test_db.query(model).count()
#         if count == 0:
#             print(f"[❌] {name} records not found.")
#         else:
#             print(f"[✅] {name} count: {count}")

# def test_raw_sql_inspection(test_db):
#     result = test_db.execute(text("SELECT * FROM tbl_category")).fetchall()
#     print(result)
