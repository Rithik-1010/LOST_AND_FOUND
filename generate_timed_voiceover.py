import asyncio
import edge_tts
import os

VOICE = "en-US-BrianMultilingualNeural"

# Perfectly timed to match the recorded actions:
# Scene 1: Feed & live search (0s - 18s) -> 17s audio
# Scene 2: Post item reporting (18s - 48s) -> 28s audio
# Scene 3: Item detail & claim submission (48s - 64s) -> 15s audio
# Scene 4: Student profile & Karma reputation (64s - 79s) -> 14s audio
SCENES = [
    {
        "id": "scene1",
        "rate": "+22%",
        "text": "Losing something on campus is stressful, and finding the owner is just as tough. Welcome to the Campus Lost and Found Portal, built with Next.js and FastAPI. From the live feed, students can instantly search items like misplaced AirPods and filter by lost, found, or category in real time."
    },
    {
        "id": "scene2",
        "rate": "+20%",
        "text": "Reporting an item takes under a minute. Here, a student logs a found pair of Sony noise cancelling headphones at the Central Library. We record the exact campus zone, specify the safe custody desk on the second floor, document brand and condition, and attach a photo before posting directly to the campus feed."
    },
    {
        "id": "scene3",
        "rate": "+22%",
        "text": "To prevent fraud, the portal features a proof of ownership system. Students submit confidential verification details like serial numbers, hidden tags, or bag contents, along with their contact info so owners and staff can safely verify and confirm physical handover."
    },
    {
        "id": "scene4",
        "rate": "+22%",
        "text": "Good deeds earn recognition! The portal tracks student karma, awarding the Good Samaritan ranking when items are returned. Students can manage all reports and claims right from their dashboard. Reconnecting campus communities, one item at a time."
    }
]

async def generate():
    recordings_dir = os.path.abspath("recordings")
    for s in SCENES:
        clip_path = os.path.join(recordings_dir, f"{s['id']}_timed.mp3")
        comm = edge_tts.Communicate(s["text"], VOICE, rate=s["rate"])
        await comm.save(clip_path)
        print(f"Generated {clip_path}")

if __name__ == "__main__":
    asyncio.run(generate())
