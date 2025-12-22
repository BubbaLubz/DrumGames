from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from database import Base

#autoincrement means it will automatically increase by 1 each time a new entry is added
#Primary key means it is the unique identifier for each entry
#Nullable means it cannot be empty
#Unique means no two entries can have the same value for this field
#String(20) means the maximum length of the string is 20 characters

#Rudiment Class

rudiment_tags = Table(
    'rudiment_tags',
    Base.metadata,
    Column('rudiment_id', Integer, ForeignKey('rudiments.id'), primary_key = True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key = True)
)

class Rudiment(Base):
    __tablename__ = "rudiments"

    id = Column(Integer, primary_key=True, autoincrement=True)  
    name = Column(String, unique=True, nullable=False)
    rudDifficulty = Column(Integer, ForeignKey('difficulties.id'), nullable=False)
    sticking = Column(String(50), nullable=False)
    hybrid = Column(Boolean, nullable=False)
    tags = relationship("Tags", secondary = rudiment_tags, back_populates = "rudiments")

    flam_positions = Column(String(50), nullable = True)
    diddle_positions = Column(String(50), nullable = True)
    buzz_positions = Column(String(50), nullable = True)

    pattern_length = Column(Integer, nullable = False)
    switchHandsonRepeat = Column(Boolean, nullable = False)
    

#Grid Class

grid_tags = Table(
    'grid_tags',
    Base.metadata, 
    Column('grid_id', Integer, ForeignKey('grids.id'), primary_key = True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key = True)
)

class Grid(Base):
    __tablename__ = "grids"

#Independence can be true or false no matter the type of grid

    id = Column(Integer, primary_key=True, autoincrement=True)
    movingGrid = Column(Boolean, nullable=False)
    modulatingGrid = Column(Boolean, nullable=False)
    independenceGrid = Column(Boolean, nullable=False)
    baseRudimentId = Column(Integer, ForeignKey('rudiments.id'), nullable=False)
    gridDifficulty = Column(Integer, ForeignKey('difficulties.id'), nullable=False)
    tags = relationship("Tags", secondary = grid_tags, back_populates = "grids")

#Tags Class
class Tags(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    rudiments = relationship("Rudiment", secondary = rudiment_tags, back_populates = "tags")
    grids = relationship("Grid", secondary = grid_tags, back_populates = "tags")

#Difficulty Class

class Difficulty(Base):
    __tablename__ = "difficulties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    difficultyLevel = Column(String, unique=True, nullable=False)