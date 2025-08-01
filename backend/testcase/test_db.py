from sqlalchemy import create_engine, URL , text
from sqlalchemy.orm import sessionmaker, declarative_base
from settings.config import secret
from sqlalchemy_utils import database_exists, create_database

# database connection code here

db_url_test= "postgresql://postgres:Lucifer@localhost/test_db"

test_engine= create_engine(db_url_test, pool_pre_ping= True)

# create db if not exist
if not database_exists(test_engine.url):
    create_database(test_engine.url)
    print('----- Database created! -----')

session_local_test= sessionmaker(autocommit= False, autoflush= False, bind= test_engine)
Base_test= declarative_base()

def get_test_db():
    db= session_local_test()
    try:
        yield db
    finally:
        db.close()

try:
    db= session_local_test()
    db.execute(text('SELECT 1'))
    print('\n----- Connected to db! -----')
except Exception as e:
    print('\n----- Connection failed! ERROR : ', e)


