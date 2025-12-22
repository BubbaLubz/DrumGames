from database import SessionLocal
import crud

session = SessionLocal()

print("=== TESTING TAGS ===\n")

# Step 1: Create tags
print("Creating tags...")
essential = crud.create_tag(session, "Essential")
sticking = crud.create_tag(session, "Sticking Pattern")
advanced = crud.create_tag(session, "Advanced Technique")
print(f"✅ Created 3 tags\n")

# Step 2: Get rudiments
print("Finding rudiments...")
paradiddle = crud.get_rudiment_by_name(session, "Single Paradiddle")
double_stroke = crud.get_rudiment_by_name(session, "Double Stroke Roll")

if paradiddle:
    print(f"✅ Found: {paradiddle.name}\n")
    
    # Step 3: Add tags to rudiment
    print("Adding tags to Single Paradiddle...")
    crud.add_tag_to_rudiment(session, paradiddle.id, essential.id)
    crud.add_tag_to_rudiment(session, paradiddle.id, sticking.id)
    print("✅ Tags added\n")
    
    # Step 4: Show tags for this rudiment
    print(f"Tags for {paradiddle.name}:")
    for tag in crud.get_tags_from_rudiment(session, paradiddle.id):
        print(f"  - {tag.name}")
    print()

if double_stroke:
    print(f"Adding 'Essential' tag to {double_stroke.name}...")
    crud.add_tag_to_rudiment(session, double_stroke.id, essential.id)
    print("✅ Tag added\n")

# Step 5: Show all rudiments with "Essential" tag
print("All rudiments with 'Essential' tag:")
for rud in crud.get_rudiments_by_tag(session, essential.id):
    print(f"  - {rud.name}")

# Step 6: Show all tags
print("\n📋 All tags in database:")
for tag in crud.show_all_tags(session):
    print(f"  - {tag.name}")

session.close()
print("\n✅ Tag test complete!")