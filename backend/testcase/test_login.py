import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import MagicMock
from passlib.context import CryptContext
from main import app  # Your FastAPI app
from settings.db import Base, get_db
from models.access_control import User  # Your User model
from settings.auth import pwd_context  # Your password hashing utility

# Create a test client
client = TestClient(app)

# Password context for hashing passwords during testing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create a sample user
from types import SimpleNamespace  # for a quick mock object

def create_test_user():
    hashed_password = pwd_context.hash("ProvinceAdmin")
    mock_role = SimpleNamespace(id=2, name="Admin")  # or use a real Role model if available
    return User(
        id=1,
        role_id=2,
        role=mock_role,  # ← Fix here
        province_id=5,
        name="ProvinceAdmin",
        email="provineadmin@gmail.com",
        mobile_no='1234567890',
        username="ProvinceAdmin",
        password=hashed_password,
        resign=False
    )

# Mock the database session
@pytest.fixture
def mock_db(monkeypatch):
    def override_get_db():
        db = MagicMock(spec=Session)
        test_user = create_test_user()
        db.query().filter().first.return_value = test_user
        yield db
    app.dependency_overrides[get_db] = override_get_db

# Test login success
def test_login_success(mock_db):
    response = client.post(
        "/access/login",
        data={"username": "ProvinceAdmin", "password": "ProvinceAdmin"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is True
    assert data["access_token"] is not None
    assert data["user"]["username"] == "ProvinceAdmin"

# Test login failure (wrong password)
def test_login_wrong_password(mock_db):
    response = client.post(
        "/access/login",
        data={"username": "ProvinceAdmin", "password": "wrongpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] is False
    assert "Invalid username or password" in data["details"]