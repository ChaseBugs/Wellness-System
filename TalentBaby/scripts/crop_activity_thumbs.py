"""
Crop activity thumbnail images from UI screenshots.
Saves one 285×~273px PNG per unique activity into backend/public/images/activities/.
"""
from PIL import Image
import numpy as np
import os, re

# ── Activity → ordered list of (screenshot, [activity names in row order]) ──
ACTIVITIES = {
    "1": {
        "Screenshot_20260324-151716.png": ["Checkerboard","Spa Time","Music","Tummy Time L1","Palmar Reflex"],
        "Screenshot_20260324-151724.png": ["My Face","Responding To Sound","Plantar Reflex","Recognizing Voices","Familiar Songs"],
        "Screenshot_20260324-151734.png": ["Tactile Sense","Spatial Movements","Hand And Arms","Here I Am","Rooting Reflex"],
        "Screenshot_20260324-151740.png": ["Moro Reflex","Eye Focus","Body Exploration","Sucking Reflex","Black And White"],
        "Screenshot_20260324-151806.png": ["Love Her/Him","Different Sounds And Intensity"],
    },
    "2": {
        "Screenshot_20260324-173352.png": ["Act Out A Rhyme","Checkerboard","Sound Direction","Explore Surroundings"],
        "Screenshot_20260324-173359.png": ["Spa Time","Music","Tummy Time L1","Cross Legs","Palmar Reflex","My Face"],
        "Screenshot_20260324-173406.png": ["My Face","Responding To Sound","Plantar Reflex","Recognizing Voices","Familiar Songs","Tactile Sense"],
        "Screenshot_20260324-173412.png": ["Tactile Sense","Spatial Movements","Cross Hands","Introducing New People","Recognizing Hands And Feet","Hand And Arms"],
        "Screenshot_20260324-173419.png": ["Hand And Arms","Here I Am","Rooting Reflex","Moro Reflex","Eye Focus","Body Exploration"],
        "Screenshot_20260324-173426.png": ["Body Exploration","Sucking Reflex","Black And White","Love Her/Him","Object Grip","Story Snuggle"],
        "Screenshot_20260324-173431.png": ["Story Snuggle","Leg Cycling","Eye Gazing","Nerve Stimulation","Face To Face Time","Encourage Sounds"],
        "Screenshot_20260324-173436.png": ["Eye Gazing","Nerve Stimulation","Face To Face Time","Encourage Sounds","Leg Fold","Naked Time"],
    },
    "3": {
        "Screenshot_20260324-173503.png": ["Act Out A Rhyme","Checkerboard","Sound Direction","Explore Surroundings"],
        "Screenshot_20260324-173511.png": ["Spa Time","Tactile Sense 2","Music","Tummy Time L1","Cross Legs","Eye Movement"],
        "Screenshot_20260324-173524.png": ["Eye Movement","Recognizing Hands","Bedtime Stories","Head Lift L1","My Face","Responding To Sound"],
        "Screenshot_20260324-173534.png": ["Making Sounds","Neck Movement","Tactile Sense","Spatial Movements","Cross Hands","Introducing New People"],
        "Screenshot_20260324-173543.png": ["Introducing New People","Recognizing Hands And Feet","Hand And Arms","Here I Am","Eye Focus","Body Exploration"],
        "Screenshot_20260324-173550.png": ["Body Exploration","Black And White","Love Her/Him","Bedtime Kisses","Understanding Baby","Body Positioning"],
        "Screenshot_20260324-173557.png": ["Body Positioning","Finger Grip","Object Grip","Pushing Legs","Lifting By Hands","Side Moves"],
        "Screenshot_20260324-173604.png": ["Side Moves","Cycle Movement","Story Snuggle","Respond To Baby","Distinguish Sounds","Language L1"],
        "Screenshot_20260324-173618.png": ["Responding To Sounds","Fetch A Toy","Leg Cycling","Eye Gazing","Nerve Stimulation","Face To Face Time"],
        "Screenshot_20260324-173626.png": ["Face To Face Time","Encourage Sounds","Leg Fold","Naked Time","Slow Dance","Multiple Voice Same Sounds"],
        "Screenshot_20260324-173630.png": ["Encourage Sounds","Leg Fold","Naked Time","Slow Dance","Multiple Voice Same Sounds"],
    },
    "4": {
        "Screenshot_20260324-173830.png": ["Source Of Sound","The Touch","Creeping L1","Bring The Toy Closer"],
        "Screenshot_20260324-173839.png": ["Bath Time Fun","Different Aromas","Tactile Sense 2","Explore Surrounding With Sound","Eye Movement","Photo Book"],
        "Screenshot_20260324-173846.png": ["Photo Book","Recognizing Hands","Bedtime Stories","Reinforce Places And Toys","Describe Actions","Tracking Sound"],
        "Screenshot_20260324-173853.png": ["Tracking Sound","Stronger Grip","Leg Bending","Expressions","Speaking Differently","Discovery With My Mouth"],
        "Screenshot_20260324-173859.png": ["Discovery With My Mouth","Recognizing Family","Follow My Hand","Body Positioning","Pushing Legs","Lifting By Hands"],
        "Screenshot_20260324-173907.png": ["Lifting By Hands","Rolling","Head Lift L2","Cycle Movement","Holding Objects","Mirror"],
        "Screenshot_20260324-173914.png": ["Mirror","Distinguish Sounds","Wind Chime","Language L1","Responding To Sounds","Fetch A Toy"],
        "Screenshot_20260324-173921.png": ["Fetch A Toy","Object Feeling","My Name","Lifting And Spinning","Sucking Sound","Laughing"],
        "Screenshot_20260324-173927.png": ["Laughing","Introducing New People II","Explain Actions To Baby","Imitation Game","Signs Of Affection","Mirror Play"],
        "Screenshot_20260324-173932.png": ["Introducing New People II","Explain Actions To Baby","Imitation Game","Signs Of Affection","Mirror Play","Pet Friend"],
    },
    "5": {
        "Screenshot_20260324-174317.png": ["Noise And Sound Together","Lip Sounds L1","Creeping L1","Squats"],
        "Screenshot_20260324-174324.png": ["Leg Exercise","Light Show","Different Aromas","Explore Surrounding With Sound","Photo Book","Reinforce Places And Toys"],
        "Screenshot_20260324-174332.png": ["Reinforce Places And Toys","Action & Sound","Flying Bird","Look Around","Combine Actions","Spatial Movements"],
        "Screenshot_20260324-174340.png": ["Spatial Movements","Hand Movements","Talk And Move","Stronger Grip","Leg Bending","Stand-Up On Legs"],
        "Screenshot_20260324-174429.png": ["Light Show","Different Aromas","Explore Surrounding With Sound","Photo Book","Reinforce Places And Toys","Action & Sound"],
        "Screenshot_20260324-174438.png": ["Action & Sound","Flying Bird","Look Around","Combine Actions","Spatial Movements","Hand Movements"],
        "Screenshot_20260324-174444.png": ["Hand Movements","Talk And Move","Stronger Grip","Leg Bending","Stand-Up On Legs","Neck Movement"],
        "Screenshot_20260324-174450.png": ["Neck Movement","Hand And Arms","Read A Book","Expressions","What Is On My Feet","Discovery With My Mouth"],
        "Screenshot_20260324-174458.png": ["Discovery With My Mouth","Recognizing Family","Follow My Hand","Creeping L2","Sitting Experience","Holding Objects"],
        "Screenshot_20260324-183346.png": ["Holding Objects","Sitting Posture","Side Stretch","Back Exercise","Mirror","Hand Games"],
        "Screenshot_20260324-183358.png": ["Hand Games","Wind Chime","Help To Express Joy","Introducing New People II","Explain Actions To Baby","Imitation Game"],
        "Screenshot_20260324-183405.png": ["Imitation Game","Signs Of Affection","Definition Of No","Sound And Events","Temperature Sense","Pet Friend"],
        "Screenshot_20260324-183410.png": ["Imitation Game","Signs Of Affection","Definition Of No","Sound And Events","Temperature Sense","Pet Friend"],
    },
    "7": {
        "Screenshot_20260324-183452.png": ["Book Trick","Noise And Sound Together","Lip Sounds L1","Tongue Movements","Squats"],
        "Screenshot_20260324-183459.png": ["Walking On Legs","Shoulder And Arms Lift","Babble Talks","Object Permanence 2","Combine Actions"],
        "Screenshot_20260324-183506.png": ["Roll Over","Sounds Of Nature","Talk And Move","Face Down To Face Up","Neck Movement"],
        "Screenshot_20260324-183513.png": ["Tilt Balance","Building Vocabulary L1","Sitting Up","Rhyme & Dance","Explore Surroundings"],
        "Screenshot_20260324-183519.png": ["Object Permanence 1","Fixing Eyesight","Controlling Sound","Sitting Posture","Side Stretch"],
        "Screenshot_20260324-183526.png": ["Back Exercise","Back Muscle Stretch","Sitting Practice","Rolling 360","Mirror 2"],
        "Screenshot_20260324-183532.png": ["Recognising Name","Hand Eye Coordination","Roly Poly Toy","Grasping Small Objects","Say Goodbye"],
        "Screenshot_20260324-183538.png": ["Explain Actions To Baby","Imitation Game","Signs Of Affection","Definition Of No","Sound And Events"],
        "Screenshot_20260324-183544.png": ["Temperature Sense","Mirror Play","Pet Friend"],
    },
    "8": {
        "Screenshot_20260324-190302.png": ["Talking Through Sound","Another World","Switch On & Off","Paper Shredding"],
        "Screenshot_20260324-190309.png": ["Single Syllables","Playing With Balloons","Sound & Light","Explore Nature","Cause & Effect"],
        "Screenshot_20260324-190316.png": ["Squeezing A Sponge","Object Permanence 5","Object Tracking","Exploring Round Objects","Peek A Boo"],
        "Screenshot_20260324-190324.png": ["Rotating On Stomach","Bouncing Ball","Object Permanence 4","Read And Act","Standing Foundation"],
        "Screenshot_20260324-190329.png": ["Standing Up Foundation L2","Hand And Arms","Hand Movements","Observe The Toy","Where Did It Go"],
        "Screenshot_20260324-190335.png": ["Regaining Sitting Posture","Standing Up Foundation L1","Yes & No L1","Balancing","Parachute Reflex"],
        "Screenshot_20260324-190344.png": ["Crawling Foundation L3","Starting To Crawl","Moving Forward","Laughing 2","Clapping"],
        "Screenshot_20260324-190351.png": ["Animal Sounds","Grasping Small Objects","Say Goodbye","Lip Lesson","Mirror 3"],
        "Screenshot_20260324-190359.png": ["Putting Things In Box","Clapping Hands","Social Exposure","Phone Conversation","Crawling With Obstacles"],
        "Screenshot_20260324-190404.png": ["Daily Moments"],
    },
    "9": {
        "Screenshot_20260324-190500.png": ["Paper Shredding","Clap With Me","Single Syllables","Differentiating Tone & Volumes"],
        "Screenshot_20260324-190507.png": ["Playing With Balloons","Cause & Effect","Holding 3 Objects","Play Date","Greeting"],
        "Screenshot_20260324-190514.png": ["Object Tracking","Exploring Round Objects","Toy In The Box","Pull Action","Object Finding Game"],
        "Screenshot_20260324-190520.png": ["Object Revealing","Shake The Bottle","Playing Drums","Building Vocabulary L2","Bouncing Ball"],
        "Screenshot_20260324-190526.png": ["Object Permanence 4","Shaping Things With Hands","Read And Act","Creating Sounds","Standing Foundation"],
        "Screenshot_20260324-190532.png": ["Standing Up Foundation L2","Verbal Directions","Fast & Slow Clapping","Finger Pick And Drop","Removing Rings"],
        "Screenshot_20260324-190539.png": ["Where Did It Go","Getting The Toy","Counting Toes","Goof Off","Finding Sound Source"],
        "Screenshot_20260324-190547.png": ["Rotating Objects","Crawling Long Distance","Standing Up","Walk With Help","Moving Forward"],
        "Screenshot_20260324-190555.png": ["One Hand To Other","Animal Sounds","Taking Out Things","Standing Foundation L3","Join The Fun"],
        "Screenshot_20260324-190600.png": ["Mirror 3","Putting Things In Box","Clapping Hands","Social Exposure","Phone Conversation"],
        "Screenshot_20260324-190605.png": ["Crawling With Obstacles","Daily Moments"],
    },
    "10": {
        "Screenshot_20260324-230211.png": ["Clap With Me","Learning Through Books","Three Objects","Do Messy Painting"],
        "Screenshot_20260324-230502.png": ["Granularity","Stacking Rings","Messy Activity","Squeezing A Sponge","Greeting","Pull Action"],
        "Screenshot_20260324-230508.png": ["Pull Action","Object Finding Game","Finger Pinching And Poking","Building Vocabulary L2","Find The Object","Finger Grasp"],
        "Screenshot_20260324-230513.png": ["Finger Grasp","Stand Without Support","Removing Rings","Stand Up","Yes & No L2","Tactical Grip"],
        "Screenshot_20260324-230521.png": ["Tactical Grip","Getting The Toy","Anticipating Events 2","Counting Toes","Image Vs Live Objects","Peekaboo Bath"],
        "Screenshot_20260324-230529.png": ["Peekaboo Bath","Dada And Mama","Goof Off","Finding Sound Source","Gesture Communication","Rotating Objects"],
        "Screenshot_20260324-230535.png": ["Rotating Objects","Standing Up","Walk With Help","Walking With Assistance L1","Hugs And Kisses","Climbing Down A Step"],
        "Screenshot_20260324-230542.png": ["Climbing Down A Step","Standing Foundation L3","Turning The Pages","Playing With Siblings","Social Exposure","Daily Moments"],
        "Screenshot_20260324-230552.png": ["Daily Moments","Climbing Up A Step","Learn To Sit Down","Head To Head","Repeat Actions","Reading Book By Themselves"],
    },
    "11": {
        "Screenshot_20260324-230631.png": ["Play With Dough","Learning Through Books","Three Objects","Tasting Time"],
        "Screenshot_20260324-230641.png": ["Do Messy Painting","Granularity","Stretch The Feet","Fluid Difference","Sitting To Standing Position","Stacking Rings"],
        "Screenshot_20260324-230649.png": ["Stacking Rings","Hold And Walk","Squeezing A Sponge","Similar And Different","Sound Vibrations","Finger Pinching And Poking"],
        "Screenshot_20260324-230656.png": ["Finger Pinching And Poking","Stand And Play","Weather Talk","Find The Object","Crawl Through Tunnel","Stand And Lift"],
        "Screenshot_20260324-230702.png": ["Stand And Lift","Finger Grasp","Stand Without Support","Walking With Support","Learn To Walk","Stand Up"],
        "Screenshot_20260324-230708.png": ["Stand Up","Walking With Assistance L2","Tactical Grip","Curious In Park","Sing To Baby","Phone Conversation"],
        "Screenshot_20260324-230715.png": ["Phone Conversation","Tickling Spider","Fishing In A Bathtub","Visiting People","Hugs And Kisses","Body Part"],
        "Screenshot_20260324-230722.png": ["Body Part","Turning The Pages","Throwing Ball L1","Climbing Up A Step","Learn To Sit Down","Head To Head"],
        "Screenshot_20260324-230728.png": ["Head To Head","Repeat Actions","Standing On Soft Surface","Empty A Container","Reading Book By Themselves"],
    },
    "12": {
        "Screenshot_20260324-230752.png": ["Play With Dough","Open & Close","Different Aromas 2","Tasting Time"],
        "Screenshot_20260324-230800.png": ["Stretch The Feet","Fluid Difference","Sitting To Standing Position","Sponge Play","Memory Training","Who Is In The Mirror"],
        "Screenshot_20260324-230806.png": ["Who Is In The Mirror","Fun With Paper","Similar And Different","Sound Vibrations","Walking With Objects","Weather Talk"],
        "Screenshot_20260324-230823.png": ["Finger Painting","Learn To Walk","Taking Objects","Moving Large Objects","Familiarize With Family","Walking With Assistance L2"],
        "Screenshot_20260324-230829.png": ["Walking With Assistance L2","Curious In Park","Motion And Direction","Give And Take","Object Identification","Posture Words"],
        "Screenshot_20260324-230835.png": ["Posture Words","Sing To Baby","Fishing In A Bathtub","Visiting People","Hide And Seek","Web Basket"],
        "Screenshot_20260324-230841.png": ["Web Basket","Stacking And Falling","Body Part","Empty A Container","Give The Lead"],
    },
}

def find_rows(img):
    """Returns list of (y_start, y_end) for each detected activity row."""
    arr = np.array(img)
    h = arr.shape[0]
    # Search for white/uniform rows — exclude top 200px and bottom 200px
    white = []
    for y in range(200, h - 200):
        row = arr[y, 30:1050]
        if np.mean(row) > 252 and np.std(row) < 5:
            white.append(y)

    groups = []
    if not white:
        return []
    s = white[0]; p = white[0]
    for y in white[1:]:
        if y - p > 3:
            groups.append((s, p, p - s + 1))
            s = y
        p = y
    groups.append((s, p, p - s + 1))

    # Header separators (thin): ht < 55, restricted to TOP HALF only to avoid
    # the navigation bar's thin separator near y ~ h*0.9 being misclassified.
    header_seps = [(s, e, ht) for s, e, ht in groups if ht < 55 and e < h // 2]
    # Row separators (fat): ht >= 55
    row_seps    = [(s, e, ht) for s, e, ht in groups if ht >= 55]

    content_start = (header_seps[-1][1] + 1) if header_seps else 400

    # Nav bar starts at the first thin separator in the bottom 25% of the image
    nav_start = next((s for s, e, ht in groups if ht < 55 and s > h * 0.75), h - 130)

    rows = []
    prev = content_start
    for s, e, ht in row_seps:
        if s > prev:            # valid range
            rows.append((prev, s - 1))
        prev = e + 1
    # Last partial row — clip at nav bar start to avoid capturing nav bar pixels
    if prev < h - 50:
        rows.append((prev, min(nav_start - 1, h - 130)))
    # Drop a spurious tiny first row caused by content_start landing just before
    # the first row separator (e.g. header area with no detected header_sep).
    if len(rows) > 1 and (rows[0][1] - rows[0][0]) < 200:
        rows = rows[1:]
    return rows


THUMB_X   = (60, 345)    # x bounds of the thumbnail illustration within each row
THUMB_W   = 285          # output width  (THUMB_X[1] - THUMB_X[0])
THUMB_H   = 272          # output height — all images forced to this size
TRIM_BTM  = 4            # pixels to trim from bottom of each crop (removes card border line)
BASE = r"E:\Github\Jude0629\talent-baby\ui\babyG\activity"
OUT  = r"E:\Github\Jude0629\talent-baby\backend\public\images\activities"
os.makedirs(OUT, exist_ok=True)

saved  = set()   # activity titles already saved
errors = []


def save_thumb(crop: "Image.Image", out_path: str) -> None:
    """Trim bottom border line, then resize/pad to THUMB_W × THUMB_H."""
    # Trim bottom border artefact
    crop = crop.crop((0, 0, crop.width, max(1, crop.height - TRIM_BTM)))
    # Resize to target, keeping aspect ratio, then pad with white
    crop.thumbnail((THUMB_W, THUMB_H), Image.LANCZOS)
    canvas = Image.new("RGB", (THUMB_W, THUMB_H), (255, 255, 255))
    paste_y = (THUMB_H - crop.height) // 2
    canvas.paste(crop, (0, paste_y))
    canvas.save(out_path)


for month, screenshots in ACTIVITIES.items():
    folder = os.path.join(BASE, month)
    for fname, names in screenshots.items():
        path = os.path.join(folder, fname)
        if not os.path.exists(path):
            errors.append(f"MISSING: {path}")
            continue
        img  = Image.open(path)
        rows = find_rows(img)

        for i, name in enumerate(names):
            if name in saved:
                continue        # already have this thumbnail
            if i >= len(rows):
                errors.append(f"[m{month}] {fname}: need row {i} for '{name}' (only {len(rows)} rows)")
                continue

            y0, y1 = rows[i]
            if y1 <= y0:
                errors.append(f"[m{month}] {fname} row {i} bad bounds y={y0}-{y1} for '{name}'")
                continue

            safe     = re.sub(r"[^\w\s-]", "", name).strip().replace(" ", "_")
            out_path = os.path.join(OUT, f"{safe}.png")
            save_thumb(img.crop((THUMB_X[0], y0, THUMB_X[1], y1)), out_path)
            saved.add(name)

print(f"Saved {len(saved)} unique thumbnails -> {OUT}")
if errors:
    print(f"\n{len(errors)} issues:")
    for e in errors[:30]:
        print(f"  {e}")
    if len(errors) > 30:
        print(f"  ... and {len(errors)-30} more")
