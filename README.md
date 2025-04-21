# 🔊 Voicify – Real-Time ASL Recognition for Accessibility & Expression

[DEMO]

[demo]: https://devpost.com/software/voicify-3e6n78

## Overview: 

Voicify is an AI-powered American Sign Language (ASL) recognition system that detects both individual letters of the English alphabet and commonly used English words. Our mission is to bridge communication gaps by celebrating ASL as a rich, expressive language—not just a substitute for text.

---

### 🎯 Our Goal:
We aim to assist individuals who are Deaf or hard of hearing by enhancing communication through ASL recognition, rather than relying solely on text-to-speech. Sign language is a powerful form of self-expression, culture, and identity—and it deserves to be preserved and empowered through modern technology.

---

### 🧠 Technologies Used:

📸 Computer Vision & Machine Learning
MediaPipe – for extracting hand landmark data in real-time

- Random Forest Classifier – for recognizing individual ASL letters from landmark features

- LSTM Neural Networks – for learning temporal patterns in ASL word gestures and improving word-level recognition

🌐 Full-Stack Web Integration
- React Frontend – delivers a smooth, intuitive, and accessible user experience

- Flask API Backend – powers the ML inference engine and processes video input

- OpenCV Integration – overlays real-time MediaPipe hand landmarks and predictions directly on webcam footage

- Interactive UI Components – includes real-time prediction feedback and performance visualization through charts

---

### ⚙️ Challenges We Faced:

- Integrating Python-based computer vision and machine learning models into a live React frontend for the first time

- Rendering real-time MediaPipe/OpenCV outputs seamlessly on a web canvas

- Handling noisy, low-light, or grainy video data during training

- Improving model generalization across users with different hand sizes, speeds, and signing styles

---

### 🌱 What We Learned & Gained:

- Built a fully functional full-stack application from scratch

- Gained deep hands-on experience with computer vision, ML model deployment, and frontend/backend integration

- Designed with accessibility and inclusivity at the forefront, reinforcing our belief that technology should empower—not replace—individual expression

- Showed that ASL is not just a mode of communication, but an art worth amplifying
