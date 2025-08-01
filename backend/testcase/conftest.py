import pytest
import random
import string
import json

from sqlalchemy import create_engine, inspect
from sqlalchemy_utils import create_database, drop_database, database_exists
from sqlalchemy.orm import sessionmaker

# Your imports (adjust paths if needed)
from models.access_control import Role, User, Country, State, Region, District, Module, Feature, ModuleFeature, RoleModuleFeature
from models.configuration import Portfolio, FinancialPortfolioMap
from models.category import DataTypes, FileTypes
from settings.auth import encrypt
from settings.config import secret
import os

def random_db_name():
    return "test_db_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))


@pytest.fixture(scope="session")
def test_db_url():
    base_url = "postgresql+psycopg2://postgres:Lucifer@localhost:5432/"
    db_name = random_db_name()
    test_url = base_url + db_name
    print(f"Test Db {test_url}")

    if not database_exists(test_url):
        create_database(test_url)
    yield test_url
    drop_database(test_url)  # comment this line if you want to keep DB for inspection


@pytest.fixture(scope="session")
def test_engine(test_db_url):
    engine = create_engine(test_db_url)
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def db(test_engine):
    # Create all tables fresh before each test
    from settings.db import Base  # Adjust to your declarative base
    Base.metadata.create_all(bind=test_engine)
    Session = sessionmaker(bind=test_engine)
    session = Session()
    
    initial_data_load_for_test(session)  # << Add this here to load data


    yield session

    session.close()
    # Base.metadata.drop_all(bind=test_engine)



def initial_data_load_for_test(db):
    base_path = os.path.dirname(os.path.abspath(__file__))  # folder of current test file

    with open(os.path.join(base_path, '..', 'constants', 'initial_load.json'), 'r') as f:
        initial_data = json.load(f)

    with open(os.path.join(base_path, '..', 'constants', 'country.json'), 'r') as f:
        location = json.load(f)

    inspector = inspect(db.bind)
    if 'tbl_role' in inspector.get_table_names():
        if db.query(Country).count() == 0:
            db.add_all([Country(name=i) for i in location['country']])
            db.commit()

        if db.query(State).count() == 0:
            db.add_all([State(**i) for i in location['states']])
            db.commit()

        if db.query(Region).count() == 0:
            db.add_all([Region(**i) for i in location['regions']])
            db.commit()

        if db.query(District).count() == 0:
            db.add_all([District(**i) for i in location['districts']])
            db.commit()

        if db.query(Role).count() == 0:
            db.add_all([Role(**role) for role in initial_data['roles']])
            db.commit()

        if db.query(User).count() == 0:
            db.add(User(
                name="Admin",
                email=secret.s_email,
                mobile_no='9999999999',
                mobile_country_code='91',
                role_id=secret.s_admin_role,
                username=secret.s_username,
                password=encrypt(secret.s_username)
            ))
            db.commit()

        for module_name in initial_data['modules']:
            if not db.query(Module).filter_by(name=module_name).first():
                db.add(Module(name=module_name, created_by=1, updated_by=1))
        db.commit()

        for feature_name in initial_data['features']:
            if not db.query(Feature).filter_by(name=feature_name).first():
                db.add(Feature(name=feature_name, created_by=1, updated_by=1))
        db.commit()

        for module in db.query(Module).all():
            for feature in db.query(Feature).all():
                if db.query(ModuleFeature).filter_by(module_id=module.id, feature_id=feature.id).first():
                    continue
                if module.name == 'Reports' and feature.name in ['Add', 'Edit', 'Delete']:
                    continue
                if feature.name in ['View Files', 'Manage Files'] and module.name not in initial_data['modules'][:10]:
                    continue

                mf = ModuleFeature(module_id=module.id, feature_id=feature.id, created_by=1, updated_by=1)
                db.add(mf)
                db.commit()
                db.refresh(mf)

                for role in db.query(Role).all():
                    status = False
                    if role.id in [secret.s_admin_role, secret.p_admin_role]:
                        status = True
                    elif role.name == 'DDM' and feature.name in ['View', 'Edit', 'View Files', 'Manage Files'] and module.name in initial_data['modules'][:10]:
                        status = True
                    elif role.name == 'Viewer' and feature.name in ['View', 'View Files'] and module.name in initial_data['modules'][:10]:
                        status = True

                    if not db.query(RoleModuleFeature).filter_by(role_id=role.id, module_feature_id=mf.id).first():
                        db.add(RoleModuleFeature(role_id=role.id, module_feature_id=mf.id, status=status, created_by=1, updated_by=1))
                        db.commit()

        if db.query(Portfolio).count() == 0:
            db.add_all([Portfolio(**i) for i in initial_data['portfolio']])
            db.commit()

        if db.query(FinancialPortfolioMap).count() == 0:
            for i in initial_data['financial_map']:
                db.add_all([
                    FinancialPortfolioMap(non_financial_portfolio_id=i['non_financial_portfolio_id'], financial_portfolio_id=j)
                    for j in i['financial_portfolio_id']
                ])
            db.commit()

        if db.query(DataTypes).count() == 0:
            db.add_all([DataTypes(name=i) for i in initial_data['data_types']])
            db.commit()

        if db.query(FileTypes).count() == 0:
            db.add_all([FileTypes(**i) for i in initial_data['file_types']])
            db.commit()


def test_roles_loaded(db):
    initial_data_load_for_test(db)
    count = db.query(Role).count()
    assert count > 0, f"Role count is {count}"


