from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# the main service test case
def test_main():
    response= client.get('/')
    assert response.status_code == 200
    assert response.json() == {"message": "DMS API service is started"}
