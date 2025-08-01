import pytest
from fastapi.testclient import TestClient
from main import app
from settings.db import get_db
from models.access_control import User, Role, Province, Country, State, Region, District
from models.configuration import Diocese,Community,Society
from passlib.context import CryptContext
from testcase.conftest import db as test_db
import json
from sqlalchemy import text

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

# Create required FK records and test user
@pytest.fixture(autouse=True)
def create_test_user(test_db):
    # Create Country
    # country = test_db.query(Country).filter_by(id=1).first()
    # if not country:
    #     country = Country(id=1, name="Test Country")
    #     test_db.add(country)

    # # Create State
    # state = test_db.query(State).filter_by(id=4).first()
    # if not state:
    #     state = State(id=4, name="Test State", country_id=1)
    #     test_db.add(state)

    # # Create Region
    # region = test_db.query(Region).filter_by(id=1).first()
    # if not region:
    #     region = Region(id=1, name="Test Region", state_id=4)
    #     test_db.add(region)

    # # Create District
    # district = test_db.query(District).filter_by(id=1).first()
    # if not district:
    #     district = District(id=1, name="Test District", region_id=1)
    #     test_db.add(district)

    # test_db.commit()

    # Create Province
    province = test_db.query(Province).filter_by(id=1).first()
    if not province:
        province = Province(
            id=1, name="Test Province", code="PRO0001", place="Place",
            address="address", country_id=1, state_id=4, region_id=1, district_id=1,country_ids="1",state_ids="4",region_ids="1",district_ids="1"
        )
        test_db.add(province)
    test_db.commit()
    community=test_db.query(Community).filter_by(id=2).first()
    if not community:
        communityy=Community(id=2,name="COMMUNITY", place="Place",
            address="address",province_id=1,country_id=1,state_id=4,region_id=1,district_id=1,code="COM0001")
        test_db.add(communityy)
    test_db.commit()
    
    # society=test_db.query(Society).filter_by(id=1).first()
    # if not society:
    #     society=Society(id=1,name="SOCIETY",community_id=1, place="Place",
    #         address="address",province_id=1,country_id=1,state_id=4,region_id=1,district_id=1,code="SOC0001")
    #     test_db.add(society)
    # test_db.commit()

    # Create Diocese
    diocese = test_db.query(Diocese).filter_by(id=132).first()
    if not diocese:
        diocese = Diocese(
            id=132, name="Test Diocese", province_id=1, place="Test Place", code="DIO0001",
            address="Test Address", country_id=1, state_id=4, region_id=1, district_id=1
        )
        test_db.add(diocese)

    test_db.commit()

    # Remove old test user
    old_user = test_db.query(User).filter(User.username == "ProvinceAdmin").first()
    if old_user:
        test_db.delete(old_user)
        test_db.commit()

#     # Create test user
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

# Fix auth_headers fixture: return dict, not tuple
@pytest.fixture(scope="function")
def auth_headers():
    token = get_auth_token()
    return {"Authorization": f"Bearer {token}"}


def get_auth_token():
    login_payload = {
        "username": "ProvinceAdmin",
        "password": "ProvinceAdmin"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = client.post("/access/login", data=login_payload, headers=headers)
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

def test_create_community(auth_headers):

    data = {
            "province_id": 1,
            "code": "COM0001",
            "name": "Community",
            "place": "string",
            "address": "string",
            "country_id": 1,
            "state_id": 4,
            "region_id": 1,
            "district_id": 1,
            "community_user": [],
            "cfp": []
         } 

    response = client.post("/config/community", json=data, headers=auth_headers)
    print("DEBUG RESPONSE:", response.json())
    assert response.json()["status"] is True, f"Unexpected response: {response.json()}"

def test_get_community_by_id(auth_headers):
    community_id = 1 # get actual created id
    response = client.get(f"/config/community/{community_id}", headers=auth_headers)
    assert response.status_code == 200, f"Get community failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

def test_update_community(auth_headers):
    community_id = 1
    data = {
        "province_id": 1,
        "name": "Updated Community",
        "place": "Updated Place",
        "address": "456 Community St.",
        "country_id": 1,
        "state_id": 4,
        "region_id": 1,
        "district_id": 1
    }
    response = client.put(f"/config/community/{community_id}", json=data, headers=auth_headers)
    assert response.status_code == 200, f"Update community failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

# ----------------- Society Tests -----------------
def test_create_society(auth_headers):
    community_id =1
    data = {
        "province_id": 1,
        "community_id": community_id,
        "name": "Test Society",
        "place": "Society Place",
        "address": "123 Society St.",
        "country_id": 1,
        "state_id": 4,
        "region_id": 1,
        "district_id": 1
    }
    response = client.post("/config/society", json=data, headers=auth_headers)
    assert response.status_code == 200, f"Create society failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"


def test_get_society_by_id(auth_headers):
    society_id = 1
    response = client.get(f"/config/society/{society_id}", headers=auth_headers)
    assert response.status_code == 200, f"Get society failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

def test_update_society(auth_headers):
    society_id = 1
    data = {
        "province_id": 1,
        "community_id": 1,
        "name": "Updated Society",
        "place": "Updated Place",
        "address": "456 Society St.",
        "country_id": 1,
        "state_id": 4,
        "region_id": 1,
        "district_id": 1
    }
    response = client.put(f"/config/society/{society_id}", json=data, headers=auth_headers)
    assert response.status_code == 200, f"Update society failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

# ----------------- LegalEntity Tests -----------------
import pytest
from uuid import uuid4

def get_entity_payload(portfolio_id, community_id, society_id, name):
    return {
        "province_id": 1,
        "community_id": community_id,
        "society_id": society_id,
        "portfolio_id": portfolio_id,
        "diocese_id": 132,
        "name": name,
        "type": "Some Type",
        "financial_assistance": "Yes",
        "board": "State Board",
        "affiliation": "University Affiliation",
        "faculty": "Science",
        "ug_pg": "UG",
        "school_board": "CBSE",
        "medium_of_instruction": "English",
        "grade": "Higher Secondary",
        "place": "Entity Place",
        "address": "Entity Address",
        "country_id": 1,
        "state_id": 4,
        "region_id": 1,
        "district_id": 1,
        "entity_user": [],
        "lefp": []
    }

def create_legal_entity(auth_headers, portfolio_id):
    community_id = 1
    society_id = 1
    unique_name = f"Entity {portfolio_id} - {uuid4().hex[:8]}"  # Unique name for matching

    data = get_entity_payload(portfolio_id, community_id, society_id, unique_name)
    response = client.post("/config/entity", json=data, headers=auth_headers)
    assert response.status_code == 200, f"Create failed for portfolio_id {portfolio_id}. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

    # ✅ FIX: Include required query param
    list_response = client.get(f"/config/entity?portfolio_id={portfolio_id}", headers=auth_headers)
    assert list_response.status_code == 200, f"Entity list fetch failed. Response: {list_response.text}"
    entities = list_response.json().get("data", [])

    for entity in entities:
        if entity["name"] == unique_name and entity["portfolio_id"] == portfolio_id:
            return entity["id"]

    raise AssertionError(f"Entity not found after creation: {unique_name} (portfolio_id={portfolio_id})")


# ---------- TEST CASES BELOW ----------

@pytest.mark.parametrize("portfolio_id", [3, 4, 5, 6, 7, 8, 9, 10])
def test_create_legal_entity(auth_headers, portfolio_id):
    entity_id = create_legal_entity(auth_headers, portfolio_id)
    print(f"[DEBUG] Created entity_id={entity_id} for portfolio_id={portfolio_id}")

    assert entity_id is not None

@pytest.mark.parametrize("portfolio_id", [3, 4, 5, 6, 7, 8, 9, 10])
def test_get_legal_entity(auth_headers, portfolio_id):
    entity_id = create_legal_entity(auth_headers, portfolio_id)
    response = client.get(f"/config/entity/{entity_id}", headers=auth_headers)
    assert response.status_code == 200, f"Get failed for entity_id {entity_id}. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True

@pytest.mark.parametrize("portfolio_id", [3, 4, 5, 6, 7, 8, 9, 10])
def test_update_legal_entity(auth_headers, portfolio_id):
    entity_id = create_legal_entity(auth_headers, portfolio_id)
    update_data = {
        "province_id": 1,
        "community_id": 1,
        "society_id": 1,
        "portfolio_id": portfolio_id,
        "diocese_id": 132,
        "name": "Updated Entity Name",
        "type": "Updated Type",
        "financial_assistance": "Updated Assistance",
        "board": "Updated Board",
        "affiliation": "Updated Affiliation",
        "faculty": "Updated Faculty",
        "ug_pg": "UG",
        "school_board": "ICSE",
        "medium_of_instruction": "English",
        "grade": "A",
        "place": "Updated City",
        "address": "Updated Address",
        "country_id": 1,
        "state_id": 4,
        "region_id": 1,
        "district_id": 1,
        "entity_user": [],
        "lefp": []
    }
    response = client.put(f"/config/entity/{entity_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200, f"Update failed for entity_id {entity_id}. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True

    
#--------------------Delete-------------------
@pytest.mark.parametrize("portfolio_id", [3, 4, 5, 6, 7, 8, 9, 10],)
def test_delete_legal_entity(auth_headers,portfolio_id):
    entity_id = create_legal_entity(auth_headers, portfolio_id)
    
    # ✅ Validate before calling delete
    assert entity_id is not None, f"Entity ID is None for portfolio_id {portfolio_id}"

    response = client.delete(f"/config/entity/{entity_id}", headers=auth_headers)
    assert response.status_code == 200, f"Delete failed for entity_id {entity_id}. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status after delete: {json_resp}"


def test_delete_community(auth_headers):
    community_id = 2
    response = client.delete(f"/config/community/{community_id}", headers=auth_headers)
    assert response.status_code == 200, f"Delete community failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"

def test_delete_society(auth_headers):
    society_id = 1
    response = client.delete(f"/config/society/{society_id}", headers=auth_headers)
    assert response.status_code == 200, f"Delete society failed. Response: {response.text}"
    json_resp = response.json()
    assert json_resp["status"] is True, f"Unexpected status: {json_resp}"


 