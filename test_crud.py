from database import SessionLocal, engine, Base
import crud
import os

# Delete old database (for testing)
if os.path.exists('rudiments.db'):
    os.remove('rudiments.db')
    print("🗑️  Deleted old database")

# Create fresh tables
Base.metadata.create_all(engine)
print("✅ Created new database tables")

# Start session
session = SessionLocal()

# Add test data
print("\n📝 Adding test data...")
beginner = crud.create_difficulty(session, "Beginner")
intermediate = crud.create_difficulty(session, "Intermediate")

paradiddle = crud.create_rudiment(
    session,
    "Single Paradiddle",
    beginner.id,
    "RLRR LRLL",
    False
)

double_stroke = crud.create_rudiment(
    session,
    "Double Stroke Roll",
    beginner.id,
    "RRLL RRLL",
    False
)

# Query and display
print("\n📋 All Rudiments:")
for rud in crud.show_all_rudiments(session):
    print(f"  - {rud.name} (Difficulty ID: {rud.rudDifficulty})")

session.close()
print("\n✅ Test complete!")