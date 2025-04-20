import os

DATA_DIR = './data'

for label_folder in os.listdir(DATA_DIR):
    folder_path = os.path.join(DATA_DIR, label_folder)
    if not os.path.isdir(folder_path):
        continue

    image_files = sorted(
        [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    )

    start_index = 100
    for i, filename in enumerate(image_files):
        new_name = f"{start_index + i}.jpg"
        src = os.path.join(folder_path, filename)
        dst = os.path.join(folder_path, new_name)
        os.rename(src, dst)
        print(f"[{label_folder}] Renamed: {filename} -> {new_name}")