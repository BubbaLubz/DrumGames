from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base

#autoincrement means it will automatically increase by 1 each time a new entry is added
#Primary key means it is the unique identifier for each entry
#Nullable means it cannot be empty
#Unique means no two entries can have the same value for this field
#String(20) means the maximum length of the string is 20 characters

#Rudiment Class
class Rudiment(Base):
    __tablename__ = "Rudiments"

    id = Column(Integer, primary_key=True, autoincrement=True)  
    name = Column(String, unique=True, nullable=False)
    rudDifficulty = Column(Integer, ForeignKey('difficulties.id'), nullable=False)
    sticking = Column(String(50), nullable=False)
    hybrid = Column(Boolean, nullable=False)
    

#Grid Class
class Grid(Base):
    __tablename__ = "Grids"

#Independence can be true or false no matter the type of grid

    id = Column(Integer, primary_key=True, autoincrement=True)
    movingGrid = Column(Boolean, nullable=False)
    modulatingGrid = Column(Boolean, nullable=False)
    independenceGrid = Column(Boolean, nullable=False)
    baseRudimentId = Column(Integer, ForeignKey('rudiments.id'), nullable=False)
    gridDifficulty = Column(Integer, ForeignKey('difficulties.id'), nullable=False)

#Tags Class
class Tags(Base):
    __tablename__ = "Tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)

#Difficulty Class

class Difficulty(Base):
    __tablename__ = "Difficulties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    difficultyLevel = Column(String, unique=True, nullable=False)