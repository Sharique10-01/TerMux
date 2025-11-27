import random
import time
import sys

words = ["import", "system", "override", "decrypt", "execute", "payload", "connection", "socket", "protocol", "upload", "download", "tracking", "analysis"]

while True:
    line = " ".join(random.choice(words) for _ in range(8))
    for ch in line:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(0.01)
    print()
