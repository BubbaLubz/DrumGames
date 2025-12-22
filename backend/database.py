from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine("sqlite:///./rudiments.db", echo = True)  #change to Echo = False in production

SessionLocal = sessionmaker(bind = engine)

Base = declarative_base()

