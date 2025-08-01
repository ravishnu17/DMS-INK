from apscheduler.schedulers.background import BackgroundScheduler
from settings.db import get_db
from datetime import date
from models.category import FinancialYear
import logging
import time

logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.DEBUG)

def check_and_create_financial_year():
    try:
        logging.info("Starting financial year creation job...")
        db = next(get_db()) 
        today = date.today()

        # For test
        start_date = date(today.year, 4, 1)
        end_date = date(today.year + 1, 3, 31)
        year_string = f"{today.year}-{today.year + 1}"

        existing = db.query(FinancialYear).filter(FinancialYear.year == year_string).first()
        if not existing:
            fy = FinancialYear(year=year_string, start_date=start_date, end_date=end_date)
            db.add(fy)
            db.commit()
            logging.info(f"Financial year created: {year_string}")
        else:
            logging.info(f"Financial year already exists: {year_string}")
    except Exception as e:
        logging.error(f"Error creating financial year: {e}")
        time.sleep(5)

