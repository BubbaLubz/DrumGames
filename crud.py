from sqlalchemy.orm import Session
from models import Rudiment, Difficulty, Grid, Tags

#DIFFICULTY CRUD ---
#Create Difficulty
def create_difficulty(session: Session, difficulty_name:str):
    difficulty = Difficulty(difficultyLevel=difficulty_name) #difficulty class in models.py
    session.add(difficulty)
    session.commit()
    return difficulty

#Find Grid/Rudiments by Difficulty Level
def get_difficulty_by_level(session: Session, level: str):
    return session.query(Difficulty).filter(Difficulty.difficultyLevel == level).first()

#RUDIMENT CRUD ---
#Create Rudiment
def create_rudiment(session: Session, rudiment_name: str, rud_difficulty: int, sticking: str, hybrid: bool):
    rudiment = Rudiment(name=rudiment_name, rudDifficulty=rud_difficulty, sticking=sticking, hybrid=hybrid)
    session.add(rudiment)
    session.commit()
    return rudiment

#Show all Rudiments
def show_all_rudiments(session: Session):
    return session.query(Rudiment).all()

#Get Rudiment Details
def get_rudiment_details(session: Session, rudiment_id: int):
    return session.query(Rudiment).get(rudiment_id)

#Get Rudiment by Name
def get_rudiment_by_name(session: Session, rudiment_name: str):
    return session.query(Rudiment).filter(Rudiment.name == rudiment_name).first()

#Get Rudiment by difficulty
def get_rudiment_by_difficulty(session: Session, difficulty_id: int):
    return session.query(Rudiment).filter(Rudiment.rudDifficulty == difficulty_id).all()

#Get Rudiment by tags
pass

#GRID CRUD ---
#Create Grid
def create_grid(session: Session, moving_grid: bool, modulating_grid: bool, independence: bool, base_rudiment_id: int, grid_difficulty: int):
    grid = Grid(movingGrid=moving_grid, modulatingGrid=modulating_grid, independenceGrid=independence, baseRudimentId=base_rudiment_id, gridDifficulty=grid_difficulty)
    session.add(grid)
    session.commit()
    return grid


#Show all Grids
def show_all_Grids(session: Session):
    return session.query(Grid).all()

#Get Grid Details
def get_grid_details(session: Session, grid_id: int):
    return session.query(Grid).filter(Grid.id == grid_id).first()

#Get Grid by difficulty
def get_grid_by_difficulty(session: Session, difficulty_id: int):
    return session.query(Grid).filter(Grid.gridDifficulty == difficulty_id).all()

#Get Grid by base Rudiment
def get_grid_by_base_rudiment(session: Session, rudiment_id: int):
    return session.query(Grid).filter(Grid.baseRudimentId == rudiment_id).all()

#Get Grid by type (moving/modulating)
def get_grid_by_type(session: Session, moving: bool = None, modulating: bool = None, independence: bool = None):
    query = session.query(Grid)
    if moving is not None:
        query = query.filter(Grid.movingGrid == moving)
    if modulating is not None:
        query = query.filter(Grid.modulatingGrid == modulating)
    if independence is not None:
        query = query.filter(Grid.independenceGrid == independence)
    return query.all()

#Get grid by tags
pass

#TAG CRUD ---
#Create Tag
def create_tag(session: Session, tag_name: str):
    tag = Tags(name=tag_name)
    session.add(tag)
    session.commit()
    return tag 

#Show all Tags
def show_all_tags(session: Session):
    return session.query(Tags).all()

#Add Tag to Rudiment
pass

#Add Tag to Grid
pass
