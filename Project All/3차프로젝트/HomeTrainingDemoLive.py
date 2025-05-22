# 1. 라이브러리 불러오기
 
import cv2
 
import numpy as np
 
import mediapipe as mp
 
# 2. 각도 계산 함수 정의
 
def calculate_angle(a, b, c):
 
    """중심점 b 기준으로 a-b-c 사이 각도를 계산하는 함수"""
 
    a, b, c = np.array(a), np.array(b), np.array(c)
 
    ba = a - b
 
    bc = c - b
 
    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
 
    return np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0)))
 
# 3. MediaPipe 구성
 
mp_drawing = mp.solutions.drawing_utils
 
mp_drawing_styles = mp.solutions.drawing_styles
 
mp_pose = mp.solutions.pose
 
# 4. 웹캠 스트리밍 시작
 
cap = cv2.VideoCapture(0)
 
# 카운팅 상태 초기화
 
counter = 0
 
state = "Up"
 
side = "RIGHT"
 
# 5. 포즈 추론 실행
 
with mp_pose.Pose(
 
    static_image_mode=False,
 
    model_complexity=2,
 
    enable_segmentation=False,
 
    min_detection_confidence=0.5,
 
    min_tracking_confidence=0.5
 
) as pose:
 
    while cap.isOpened():
 
        success, image = cap.read()
 
        if not success:
 
            print("프레임을 가져올 수 없습니다.")
 
            break
 
        # 6. 이미지 전처리
 
        image.flags.writeable = False
 
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
 
        results = pose.process(image)
 
        image.flags.writeable = True
 
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
 
        if results.pose_landmarks:
 
            lm = results.pose_landmarks.landmark
 
            h, w, _ = image.shape
 
            def get_point(lm): return [int(lm.x * w), int(lm.y * h)]
 
            # 좌우 어깨 visibility 비교 → 잘 보이는 쪽 선택
 
            r_vis = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER].visibility
 
            l_vis = lm[mp_pose.PoseLandmark.LEFT_SHOULDER].visibility
 
            side = "RIGHT" if r_vis > l_vis else "LEFT"
 
            # 선택된 쪽의 관절 위치 및 visibility 추출
 
            if side == "RIGHT":
 
                shoulder = get_point(lm[mp_pose.PoseLandmark.RIGHT_SHOULDER])
 
                elbow = get_point(lm[mp_pose.PoseLandmark.RIGHT_ELBOW])
 
                wrist = get_point(lm[mp_pose.PoseLandmark.RIGHT_WRIST])
 
                s_vis = r_vis
 
                e_vis = lm[mp_pose.PoseLandmark.RIGHT_ELBOW].visibility
 
                w_vis = lm[mp_pose.PoseLandmark.RIGHT_WRIST].visibility
 
            else:
 
                shoulder = get_point(lm[mp_pose.PoseLandmark.LEFT_SHOULDER])
 
                elbow = get_point(lm[mp_pose.PoseLandmark.LEFT_ELBOW])
 
                wrist = get_point(lm[mp_pose.PoseLandmark.LEFT_WRIST])
 
                s_vis = l_vis
 
                e_vis = lm[mp_pose.PoseLandmark.LEFT_ELBOW].visibility
 
                w_vis = lm[mp_pose.PoseLandmark.LEFT_WRIST].visibility
 
            # 신뢰도 기준 통과한 경우에만 분석
 
            if s_vis > 0.85 and e_vis > 0.85 and w_vis > 0.85:
 
                angle = calculate_angle(shoulder, elbow, wrist)
 
                # 상태 전이 및 카운팅 로직
 
                if angle < 90:
 
                    state = "Down"
 
                elif 95 <= angle <= 140:
 
                    state = "Mid"
 
                elif angle > 140 and state == "Mid":
 
                    state = "Up"
 
                    counter += 1
 
                    print(f"Push-up Count: {counter}")
 
                # 상태 텍스트 표시
 
                cv2.putText(image, f'Angle: {int(angle)}', (30, 80),
 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
 
                cv2.putText(image, f'Count: {counter}', (30, 130),
 
                            cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 0), 3)
 
        # 랜드마크 시각화
 
        if results.pose_landmarks:
 
            mp_drawing.draw_landmarks(
 
                image=image,
 
                landmark_list=results.pose_landmarks,
 
                connections=mp_pose.POSE_CONNECTIONS,
 
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style(),
 
                connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)
 
            )
 
        # 7. 화면 출력
 
        cv2.imshow('Push-up Counter', image)
 
        if cv2.waitKey(1) & 0xFF == 27:
 
            break
 
# 8. 종료 처리
 
cap.release()
 
cv2.destroyAllWindows()
 
print("프로그램 종료 완료")