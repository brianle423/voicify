import os
import cv2

# Directory to save images
DATA_DIR = './data'

# Letters your model struggles with (class IDs)
target_classes = [0, 10, 12, 13, 17, 18, 19, 20, 21]  # A, K, M, N, R, S, T, U, V
dataset_size = 100  # Number of new images to collect per class

# Create the main directory if needed
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

cap = cv2.VideoCapture(0)

for j in target_classes:
    class_dir = os.path.join(DATA_DIR, str(j))
    if not os.path.exists(class_dir):
        os.makedirs(class_dir)

    # Find the next available index to start saving
    existing_files = [f for f in os.listdir(class_dir) if f.endswith('.jpg')]
    existing_indices = [int(f.split('.')[0]) for f in existing_files if f.split('.')[0].isdigit()]
    start_idx = max(existing_indices) + 1 if existing_indices else 0

    print(f'\nCollecting data for class {j} (starting from image {start_idx})')

    # Wait until user is ready
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        cv2.putText(frame, 'Ready? Press "Q" to begin :)', (60, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 3)
        cv2.imshow('frame', frame)
        if cv2.waitKey(25) == ord('q'):
            break

    # Capture images
    counter = 0
    while counter < dataset_size:
        ret, frame = cap.read()
        if not ret:
            continue

        filename = os.path.join(class_dir, f'{start_idx + counter}.jpg')
        cv2.putText(frame, f'Class {j} | Image {start_idx + counter}', (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 0), 2)
        cv2.imshow('frame', frame)
        cv2.waitKey(25)
        cv2.imwrite(filename, frame)
        counter += 1

cap.release()
cv2.destroyAllWindows()
