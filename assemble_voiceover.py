import subprocess
import os

FFMPEG = r"C:\Users\Rithik\AppData\Local\Python\pythoncore-3.14-64\Scripts\ffmpeg.exe"

def make_silence(duration, output_path):
    cmd = [
        FFMPEG, "-y",
        "-f", "lavfi",
        "-i", "anullsrc=r=24000:cl=mono",
        "-t", str(duration),
        "-c:a", "libvorbis",
        output_path
    ]
    subprocess.run(cmd, check=True)

def to_ogg(input_path, output_path):
    cmd = [
        FFMPEG, "-y",
        "-i", input_path,
        "-c:a", "libvorbis",
        output_path
    ]
    subprocess.run(cmd, check=True)

def assemble_audio():
    recs = os.path.abspath("recordings")
    
    # Target timeline:
    # 0.0 - 0.5s: 0.5s initial pause
    # 0.5 - 17.0s: scene1 (16.51s)
    # 17.0 - 18.0s: 1.0s silence transition to scene 2
    # 18.0 - 34.5s: scene2 (16.49s)
    # 34.5 - 48.0s: 13.5s silence while filling form & photo
    # 48.0 - 62.3s: scene3 (14.26s)
    # 62.3 - 64.0s: 1.7s silence transition to profile
    # 64.0 - 76.8s: scene4 (12.79s)
    # 76.8 - 79.0s: 2.2s outro silence
    
    print("Converting mp3s to ogg...")
    to_ogg(os.path.join(recs, "scene1_timed.mp3"), os.path.join(recs, "s1.ogg"))
    to_ogg(os.path.join(recs, "scene2_timed.mp3"), os.path.join(recs, "s2.ogg"))
    to_ogg(os.path.join(recs, "scene3_timed.mp3"), os.path.join(recs, "s3.ogg"))
    to_ogg(os.path.join(recs, "scene4_timed.mp3"), os.path.join(recs, "s4.ogg"))
    
    print("Generating gap silences...")
    make_silence(0.5, os.path.join(recs, "gap0.ogg"))
    make_silence(1.0, os.path.join(recs, "gap1.ogg"))
    make_silence(13.5, os.path.join(recs, "gap2.ogg"))
    make_silence(1.7, os.path.join(recs, "gap3.ogg"))
    make_silence(2.5, os.path.join(recs, "gap4.ogg"))
    
    concat_list = os.path.join(recs, "concat_audio.txt")
    with open(concat_list, "w") as f:
        f.write(f"file '{os.path.join(recs, 'gap0.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 's1.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 'gap1.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 's2.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 'gap2.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 's3.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 'gap3.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 's4.ogg').replace(os.sep, '/')}'\n")
        f.write(f"file '{os.path.join(recs, 'gap4.ogg').replace(os.sep, '/')}'\n")
        
    full_audio = os.path.join(recs, "full_voiceover.ogg")
    print("Concatenating audio segments...")
    subprocess.run([
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        full_audio
    ], check=True)
    
    # Merge with original video
    video_in = os.path.join(recs, "demo_lost_and_found.webm")
    video_out = os.path.join(recs, "demo_lost_and_found_with_voiceover.webm")
    
    print(f"Muxing synchronized voiceover into video -> {video_out}")
    subprocess.run([
        FFMPEG, "-y",
        "-i", video_in,
        "-i", full_audio,
        "-c:v", "copy",
        "-c:a", "libvorbis",
        "-map", "0:v:0",
        "-map", "1:a:0",
        video_out
    ], check=True)
    
    print(f"Success! Output generated: {video_out}")

if __name__ == "__main__":
    assemble_audio()
