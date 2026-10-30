import asyncio
import edge_tts
import os
import subprocess

VOICE = "en-US-BrianMultilingualNeural" # Natural, sincere, approachable tech voice

SCENES = [
    {
        "id": "scene1",
        "start": 0.0,
        "text": "Losing something valuable on a bustling university campus is stressful, and locating the rightful owner can be just as hard. Welcome to the Campus Lost and Found Portal, an enterprise grade platform built with Next.js and FastAPI to streamline campus recovery. From the home feed, students can instantly browse recent reports, execute live keyword searches like finding misplaced AirPods, and filter between lost items, found belongings, or specific categories with zero latency."
    },
    {
        "id": "scene2",
        "start": 18.0,
        "text": "Reporting an item takes less than a minute. Whether you lost personal gear or found someone's belongings, you can file a structured report. Here, a student reports a found pair of Sony noise cancelling headphones at the Central Library. We record the exact campus zone, specify the secure custody location at the circulation desk, document the brand and condition, and attach an item photograph. With one click, the report is securely published to the campus wide feed."
    },
    {
        "id": "scene3",
        "start": 48.0,
        "text": "To prevent fraudulent pickups, the portal features a secure proof of ownership claim system. When a student recognizes their item, they submit confidential verification details, such as private tags, hidden contents, or serial marks, along with their student contact info. The finder or staff supervisor can review claims directly from the dashboard and confirm physical handover."
    },
    {
        "id": "scene4",
        "start": 64.0,
        "text": "Good deeds deserve recognition. The portal tracks a student's campus karma reputation, awarding badges like Good Samaritan whenever items are safely returned. Students can track all their active reports and filed claims in real time from their personal dashboard. Reconnecting campus communities, one recovered item at a time."
    }
]

async def generate_speech():
    recordings_dir = os.path.abspath("recordings")
    os.makedirs(recordings_dir, exist_ok=True)
    
    print("Generating speech audio clips for each scene...")
    for scene in SCENES:
        clip_path = os.path.join(recordings_dir, f"{scene['id']}.mp3")
        communicate = edge_tts.Communicate(scene["text"], VOICE, rate="+3%")
        await communicate.save(clip_path)
        print(f"Generated {clip_path}")

if __name__ == "__main__":
    asyncio.run(generate_speech())
