# ==============================
# 1. 라이브러리 불러오기
# ==============================
import cv2
import mediapipe as mp
import numpy as np
import json
from sklearn.linear_model import LinearRegression
from mediapipe.python.solutions.drawing_styles import get_default_pose_landmarks_style


# ==============================
# 2. 각도 계산 함수
# ==============================
def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba, bc = a - b, c - b
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0)))


# ==============================
# 3. 이동 평균 필터
# ==============================
def moving_average(points, k=5):
    if len(points) < k:
        return points
    smoothed = []
    for i in range(len(points)):
        window = points[max(0, i - k//2): min(len(points), i + k//2 + 1)]
        avg_x = np.mean([p[0] for p in window])
        avg_y = np.mean([p[1] for p in window])
        smoothed.append((avg_x, avg_y))
    return smoothed


# ==============================
# 4. 점수 평가 관련 함수
# ==============================
def normalize_coords(coords, width, height):
    return np.array([[x / width, y / height] for x, y in coords])

def linear_fit_error(points):
    X = np.array(points[:, 0]).reshape(-1, 1)
    y = np.array(points[:, 1])
    model = LinearRegression().fit(X, y)
    y_pred = model.predict(X)
    error = np.mean(np.abs(y - y_pred))
    return model, error

def sync_error(shoulder_pts, hip_pts):
    dx_s, dy_s = np.diff(shoulder_pts[:, 0]), np.diff(shoulder_pts[:, 1])
    dx_h, dy_h = np.diff(hip_pts[:, 0]), np.diff(hip_pts[:, 1])
    return np.mean(np.abs(dx_s - dx_h)), np.mean(np.abs(dy_s - dy_h))


# ==============================
# 5. 피드백 메시지 생성 함수
# ==============================
def give_feedback(shoulder_err, hip_err, sync_x, sync_y):
    feedback = []

    if shoulder_err > 0.05:
        feedback.append("동작이 앞뒤로 움직여요 ")
    else:
        feedback.append("어깨 움직임이 안정적이에요.")

    if hip_err > 0.05:
        feedback.append("골반이 흔들립니다. 허리를 고정해주세요.")
    else:
        feedback.append("골반 움직임이 안정적이에요.")

    if sync_x > 0.02 or sync_y > 0.02:
        feedback.append("어깨와 골반이 따로 움직입니다. 몸통을 하나처럼 유지하세요.")
    else:
        feedback.append("어깨와 골반이 잘 협응되고 있어요.")

    return feedback

def pelvis_angle_feedback(angle_list):
    avg_angle = np.mean(angle_list)
    if avg_angle >= 185:
        return "허리가 굽혀져 있어요. 몸체가 일직선으로 유지되도록 해주세요."
    elif 175 <= avg_angle < 185:
        return "허리 안정적이에요."
    elif avg_angle < 175:
        return "허리가 밑으로 처져있어요. 복부에 힘을 주고 척추를 펴주세요."


# ==============================
# 6. 푸쉬업 평가
# ==============================
def evaluate_pushup_from_log(log_data, counter=0):
    width, height = log_data[0]["frame_width"], log_data[0]["frame_height"]
    shoulder = normalize_coords([f["shoulder_xy"] for f in log_data], width, height)
    hip = normalize_coords([f["hip_xy"] for f in log_data], width, height)

    _, shoulder_err = linear_fit_error(shoulder)
    _, hip_err = linear_fit_error(hip)
    sync_x, sync_y = sync_error(shoulder, hip)

    pelvis_angles = [f["pelvis_angle"] for f in log_data if "pelvis_angle" in f]
    pelvis_fb = pelvis_angle_feedback(pelvis_angles)

    penalty = (shoulder_err + hip_err) * 120 + (sync_x + sync_y) * 100
    score = max(0, 100 - penalty)

    feedback = give_feedback(shoulder_err, hip_err, sync_x, sync_y)
    feedback.append(pelvis_fb)

    return {
        "score": round(score, 2),
        "counter": counter,
        "feedback": feedback
    }


# ==============================
# 7. 영상 분석 및 결과 반환
# ==============================
def analyze_pushup_video(video_path, output_video_path, output_json_path):
    mp_pose = mp.solutions.pose
    cap = cv2.VideoCapture(video_path)
    width, height = int(cap.get(3)), int(cap.get(4))
    fps = cap.get(cv2.CAP_PROP_FPS)

    out = cv2.VideoWriter(output_video_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
    log_data, frame_idx = [], 0
    state, prev_elbow_angle, counter = "Unknown", None, 0
    trajectory = {"shoulder": [], "hip": []}
    trajectory_len = int(fps)

    with mp_pose.Pose(static_image_mode=False, model_complexity=1,
                      enable_segmentation=False, smooth_landmarks=True,
                      min_detection_confidence=0.9, min_tracking_confidence=0.9) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            frame_info = {"frame": frame_idx}

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark
                def to_np(idx): return np.array([lm[idx].x * width, lm[idx].y * height])
                r_vis = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER].visibility
                l_vis = lm[mp_pose.PoseLandmark.LEFT_SHOULDER].visibility
                side = 'RIGHT' if r_vis > l_vis else 'LEFT'

                if side == "RIGHT":
                    SHOULDER, HIP = to_np(12), to_np(24)
                    ELBOW, WRIST = to_np(14), to_np(16)
                    KNEE = to_np(26)
                else:
                    SHOULDER, HIP = to_np(11), to_np(23)
                    ELBOW, WRIST = to_np(13), to_np(15)
                    KNEE = to_np(25)

                elbow_angle = calculate_angle(SHOULDER, ELBOW, WRIST)
                pelvis_angle = calculate_angle(SHOULDER, HIP, KNEE)

                if prev_elbow_angle is not None:
                    if elbow_angle > 140:
                        current_state = "Up"
                    elif 100 < elbow_angle <= 140:
                        current_state = "Mid"
                    else:
                        current_state = "Down"
                else:
                    current_state = "Unknown"

                if state == "Mid" and current_state == "Up":
                    counter += 1

                state = current_state
                prev_elbow_angle = elbow_angle

                trajectory["shoulder"].append(SHOULDER)
                trajectory["hip"].append(HIP)

                if len(trajectory["shoulder"]) > trajectory_len:
                    trajectory["shoulder"].pop(0)
                    trajectory["hip"].pop(0)

                smoothed_shoulder = moving_average(trajectory["shoulder"])
                smoothed_hip = moving_average(trajectory["hip"])

                frame_info.update({
                    "frame_width": width,
                    "frame_height": height,
                    "side_used": side,
                    "elbow_angle": elbow_angle,
                    "pelvis_angle": round(pelvis_angle, 2),
                    "shoulder_xy": [round(smoothed_shoulder[-1][0], 5), round(smoothed_shoulder[-1][1], 5)],
                    "hip_xy": [round(smoothed_hip[-1][0], 5), round(smoothed_hip[-1][1], 5)],
                    "side_visibility": round(max(r_vis, l_vis), 5)
                })
                log_data.append(frame_info)

                mp.solutions.drawing_utils.draw_landmarks(
                    image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=get_default_pose_landmarks_style(),
                    connection_drawing_spec=mp.solutions.drawing_utils.DrawingSpec(color=(255,255,255), thickness=2)
                )

            out.write(image)
            frame_idx += 1

    cap.release()
    out.release()

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)

    result = evaluate_pushup_from_log(log_data, counter=counter)

    return {
        "video_path": output_video_path,
        "json_path": output_json_path,
        "score": result["score"],
        "count": result["counter"],
        "feedback": result["feedback"]
    }
