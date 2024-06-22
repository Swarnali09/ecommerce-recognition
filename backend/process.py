import cv2
import os
import sys

def extract_frames(video_path, output_dir, interval=1):
    """
    Extract frames from a video file and save them to a directory.

    Args:
        video_path (str): Path to the video file.
        output_dir (str): Directory to save the extracted frames.
        interval (int, optional): Frame extraction interval (default: 1).

    Returns:
        None
    """
    # Validate interval
    if interval <= 0:
        raise ValueError("Interval must be a positive integer")

    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Check if video file exists and can be opened
    if not os.path.exists(video_path) or not os.path.isfile(video_path):
        raise FileNotFoundError("Video file not found or invalid")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video file")

    frame_rate = int(cap.get(cv2.CAP_PROP_FPS))
    count = 0

    video_name = os.path.basename(video_path).split('.')[0]

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if count % (frame_rate * interval) == 0:
            frame_filename = os.path.join(output_dir, f"{video_name}_frame_{count}.jpg")
            cv2.imwrite(frame_filename, frame)
        count += 1

    cap.release()

def search_frames(frame_folder, search_query):
    """
    Search for frames in a directory based on a search query.

    Args:
        frame_folder (str): Directory to search for frames.
        search_query (str): Search query (case-insensitive).

    Returns:
        list: List of matching frame file paths.
    """
    results = []
    for root, dirs, files in os.walk(frame_folder):
        for file in files:
            if search_query.lower() in file.lower():
                results.append(os.path.join(root, file))
    return results

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <video_path> <output_dir> [<interval>]")
        sys.exit(1)

    video_path = sys.argv[1]
    output_dir = sys.argv[2]
    interval = int(sys.argv[3]) if len(sys.argv) > 3 else 1

    try:
        extract_frames(video_path, output_dir, interval)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

    # Example search operation
    search_query = input("Enter search query (e.g., video name): ")
    matching_frames = search_frames(output_dir, search_query)
    print("Matching frames:")
    for frame in matching_frames:
        print(frame)