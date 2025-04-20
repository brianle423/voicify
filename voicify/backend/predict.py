# # backend/predict.py

# import pickle
# import numpy as np
# import mediapipe as mp

# model_dict = pickle.load(open('backend/model.p', 'rb'))
# model = model_dict['model']

# label_dict = {
#     0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H',
#     8: 'I', 9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P',
#     16: 'Q', 17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X',
#     24: 'Y', 25: 'Z', 26: 'delete', 27: 'space'
# }

# mp_hands = mp.solutions.hands
# hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

# def predict_from_landmarks(landmarks):
#     try:
#         x_ = [pt[0] for pt in landmarks]
#         y_ = [pt[1] for pt in landmarks]
#         data_aux = [(x - min(x_), y - min(y_)) for x, y in landmarks]
#         flat = [val for pair in data_aux for val in pair]
#         if len(flat) != 42:
#             return None
#         prediction = model.predict([np.asarray(flat)])
#         return label_dict[int(prediction[0])]
#     except:
#         return None
# backend/predict.py

import pickle
import numpy as np

# Load model once
model_dict = pickle.load(open('backend/model_v2.p', 'rb'))
model = model_dict['model']

# Label dictionary
label_dict = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H',
    8: 'I', 9: 'J', 10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P',
    16: 'Q', 17: 'R', 18: 'S', 19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X',
    24: 'Y', 25: 'Z', 26: 'delete', 27: 'space'
}

def predict_from_landmarks(landmarks: list[list[float]]) -> str:
    # landmarks is a list of 21 [x, y] pairs
    x_ = [point[0] for point in landmarks]
    y_ = [point[1] for point in landmarks]

    data_aux = []
    for x, y in landmarks:
        data_aux.append(x - min(x_))
        data_aux.append(y - min(y_))

    if len(data_aux) == 42:
        prediction = model.predict([np.asarray(data_aux)])
        predicted_character = label_dict[int(prediction[0])]
        return predicted_character
    else:
        return "invalid"
