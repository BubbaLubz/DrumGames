from generator import build_grid

spec = build_grid(
    tempo=120,
    base_rudiment_sticking="RLRR",
    grid_name="4-2-1",
    pattern_length=4,
    beats_per_bar=4,
    subdivision_per_beat=4,
    gridSequence=[4,2,1],
    switchHandOnRepeat=True,
)
print(spec)
for s in spec.strokes[:16]:
    print(s)

