from generator import build_grid

spec = build_grid(
    tempo=120,
    base_rudiment_sticking="RLRR",
    grid_name="4-2-1 16th Note Grid",
    pattern_length=4,
    beats_per_bar=48,
    subdivision_per_beat=4,
    gridSequence=[1,4,2],
    switchHandOnRepeat=True,
)
print(spec)
for s in spec.strokes[:32]:
    print(s)

def print_pattern_debug(spec):
    global hands 
    global accents 

    hands = []
    accents = []
    for s in spec.strokes:
        hands.append(s.hand)
        accents.append("^" if s.isAccent else ".")
    print("Hands:  " + " ".join(hands))
    print("Accent: " + " ".join(accents))

print_pattern_debug(spec)

hands_line = "Hands:  " + " ".join(hands)
accent_line = "Accent: " + " ".join(accents)

with open("pattern_debug.txt", "w", encoding="ascii") as f:
    f.write(hands_line + "\n")
    f.write(accent_line + "\n")
