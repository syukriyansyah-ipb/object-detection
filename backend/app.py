import cv2
import base64
import asyncio
import numpy as np
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# Load model YOLOv8
model = YOLO("yolov8n.pt")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary untuk menyimpan jumlah deteksi
detection_counts = {}

@app.websocket("/ws/detect")
async def detect_objects(websocket: WebSocket):
    await websocket.accept()
    
    cap = cv2.VideoCapture(0)  # Gunakan kamera
    if not cap.isOpened():
        await websocket.close()
        return

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Deteksi objek dengan YOLOv8
            results = model(frame)[0]  # Ambil hasil pertama
            detections = results.boxes.data.cpu().numpy()

            # Reset jumlah deteksi
            detection_counts.clear()

            for det in detections:
                x1, y1, x2, y2, conf, class_id = det
                label = results.names[int(class_id)]
                detection_counts[label] = detection_counts.get(label, 0) + 1

                # Gambar bounding box
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                cv2.putText(frame, f"{label} {conf:.2f}", (int(x1), int(y1) - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Konversi frame ke base64
            _, buffer = cv2.imencode(".jpg", frame)
            frame_base64 = base64.b64encode(buffer).decode()

            # Kirim frame & jumlah deteksi ke frontend
            await websocket.send_json({"frame": frame_base64, "counts": detection_counts})
            await asyncio.sleep(0.05)  # Streaming lebih stabil

    except Exception as e:
        print(f"Error: {e}")

    finally:
        cap.release()
        await websocket.close()
