from sqlalchemy import create_engine, URL, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database
from settings.config import secret
from settings.db_base import Base
from settings.utils.audit_events import register_audit_events


db_url = URL.create(
    drivername='postgresql',
    database=secret.database,
    username=secret.dbuser,
    password=secret.password,
    host=secret.host,
    port=secret.port
)

engine = create_engine(db_url, pool_pre_ping=True)

if not database_exists(engine.url):
    create_database(engine.url)
    print('----- Database created! -----')

session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = session_local()
    try:
        yield db
        register_audit_events(Base, db)
    finally:
        db.close()

try:
    db = session_local()
    register_audit_events(Base, db)
    db.execute(text('SELECT 1'))
    print('\n----- Connected to db! -----')
except Exception as e:
    print('\n----- Connection failed! ERROR : ', e)
