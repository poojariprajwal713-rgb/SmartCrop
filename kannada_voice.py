import sys
from gtts import gTTS

try:
    text = sys.stdin.buffer.read().decode("utf-8").strip()

    if not text:
        raise ValueError("No text provided")

    if len(text) > 5000:
        raise ValueError("Text is too long")

    voice = gTTS(
        text=text,
        lang="kn",
        slow=False,
        timeout=20
    )

    voice.write_to_fp(sys.stdout.buffer)

except Exception as error:
    print(str(error), file=sys.stderr)
    sys.exit(1)