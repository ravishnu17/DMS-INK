from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import sqlalchemy, json
from settings.db import session_local, engine
from models.access_control import Role, User, Country, State, Region, District, Module, Feature, ModuleFeature, RoleModuleFeature, Province
from models.configuration import Portfolio, FinancialPortfolioMap
from models.category import DataTypes, FileTypes, FinancialYear
from settings.config import secret
from settings.auth import encrypt
from settings.middleware.auth_context import AuthContextMiddleware
import pandas as pd
import settings.utils.financial_year_creator
from APIs import access_control, configuration, category,weblinks, answers,confreres, communication, reports,dashboard,notifications,audit

from apscheduler.schedulers.background import BackgroundScheduler
from settings.utils.financial_year_creator import check_and_create_financial_year

scheduler = BackgroundScheduler()
print(scheduler.get_jobs())
def start_scheduler():
    scheduler.remove_all_jobs()
    scheduler.add_job(check_and_create_financial_year, 'cron', month=4, day=1, hour=1, minute=1)
    scheduler.start()


def initial_data_load():
    db:Session= session_local()
    initial_data= {}
    with open('constants/initial_load.json', 'rb') as file:
        initial_data= json.load(file)

    country= pd.read_csv('constants/country.csv')
    state= pd.read_csv('constants/state.csv')
    region= pd.read_csv('constants/region.csv')
    district= pd.read_csv('constants/district.csv')


    if sqlalchemy.inspect(engine).has_table('tbl_role'):
        if db.query(Country).count() == 0:
            data= [ Country(id=row['id'],name=row['name']) for _, row in country.iterrows() if row['name']  ]
            db.add_all(data)
            db.commit()
        if db.query(State).count() == 0:
            # data= [State(**i) for i in location['states'] ]
            data= [ State(id=row['id'],name=row['name'], country_id=row['country_id']) for _, row in state.iterrows() if row['name']  ]
            db.add_all(data)
            db.commit()
        if db.query(Region).count() == 0:
            # data= [Region(**i) for i in location['regions'] ]
            data= [ Region(id=row['id'],name=row['name'], state_id=row['state_id']) for _, row in region.iterrows() if row['name']  ]
            db.add_all(data)
            db.commit()
        if db.query(District).count() == 0:
            # data= [District(**i) for i in location['districts'] ]
            data= [ District(id=row['id'],name=row['name'], state_id=row['state_id'], region_id=row['region_id']) for _, row in district.iterrows() if row['name']  ]
            db.add_all(data)
            db.commit()
            
        if db.query(Role).count() == 0:
            db.add_all([Role(**role) for role in initial_data['roles']])
        if db.query(User).count() == 0:
            db.add(User(name="Admin", email=secret.s_email, mobile_no=9999999999,mobile_country_code=91, role_id=secret.s_admin_role, username=secret.s_username, password=encrypt(secret.s_username)))
        db.commit() # save roles and admin

        # add modules
        if db.query(Module).count() != len(initial_data['modules']):
            for i in initial_data['modules']:
                if db.query(Module).filter(Module.name == i).first():
                    continue
                db.add(Module(name= i, created_by= 1, updated_by= 1))
                db.commit()

        # add features
        if db.query(Feature).count() != len(initial_data['features']):
            for i in initial_data['features']:
                if db.query(Feature).filter(Feature.name == i).first():
                    continue
                db.add(Feature(name= i, created_by= 1, updated_by= 1))
                db.commit()
        
        # each run check and add module features
        for module in db.query(Module).all():
            for feature in db.query(Feature).all():
                if db.query(ModuleFeature).filter(ModuleFeature.module_id == module.id, ModuleFeature.feature_id == feature.id).first():
                    continue
                if module.name == 'Reports' and feature.name in ['Add', 'Edit', 'Delete']:
                    continue
                if feature.name in ["View Files", "Manage Files"] and module.name not in initial_data['modules'][:10]:
                    continue
                mf= ModuleFeature(module_id= module.id, feature_id= feature.id, created_by= 1, updated_by= 1)
                db.add(mf)
                db.commit()
                db.refresh(mf)

                # add role module features
                for role in db.query(Role).all():
                    if role.id in [secret.s_admin_role, secret.p_admin_role]:
                        status= True
                    else:
                        status= False
                        if role.name == 'DDM' and feature.name in ['View', 'Edit', 'View Files', 'Manage Files'] and module.name in initial_data['modules'][:10]:
                            status= True
                        elif role.name == 'Viewer' and feature.name in ['View', 'View Files'] and module.name in initial_data['modules'][:10]:
                            status= True
                    if db.query(RoleModuleFeature).filter(RoleModuleFeature.role_id == role.id, RoleModuleFeature.module_feature_id == mf.id).first():
                        continue
                    db.add(RoleModuleFeature(role_id= role.id, module_feature_id= mf.id, status= status, created_by= 1, updated_by= 1))
                    db.commit()
    
        # add portfolios 
        if db.query(Portfolio).count() == 0:
            data= [Portfolio(**i) for i in initial_data['portfolio'] ]
            db.add_all(data)
            db.commit()
        # mapp non financial and financial portfolios
        if db.query(FinancialPortfolioMap).count() == 0:
            for i in initial_data['financial_map']:
                data= [FinancialPortfolioMap(non_financial_portfolio_id= i['non_financial_portfolio_id'], financial_portfolio_id= j) for j in i['financial_portfolio_id']]
                db.add_all(data)
            db.commit()
        # data types
        if db.query(DataTypes).count() == 0:
            data= [DataTypes(name=i) for i in initial_data['data_types'] ]
            db.add_all(data)
            db.commit()
        # file types
        if db.query(FileTypes).count() == 0:
            data= [FileTypes(**i) for i in initial_data['file_types'] ]
            db.add_all(data)
            db.commit()
        # financial years
        if db.query(FinancialYear).count() == 0:
            data= [FinancialYear(**i) for i in initial_data['financial_years'] ]
            db.add_all(data)
            db.commit()
        # province
        if db.query(Province).count() == 0:
            db.add(Province(**initial_data['province']))
            db.commit()
        # add province user
        if db.query(User).count() <= 1:
            db.add(User(**initial_data['user'], password= encrypt(initial_data['user']['username'])))
            db.commit()

app = FastAPI(
    title="DMS API",
    version="1.0",
    on_startup=[initial_data_load, start_scheduler],
)

# 1. First add AuthContextMiddleware
app.add_middleware(AuthContextMiddleware)

# 2. Then add CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def root():
    return {"message": "DMS API service is started"}

# include api routes with main app
app.include_router(access_control.loc_router)
app.include_router(access_control.access_router)
app.include_router(configuration.router)
app.include_router(category.router)
app.include_router(answers.router)
app.include_router(weblinks.router)
app.include_router(confreres.router)
app.include_router(communication.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(audit.router)

