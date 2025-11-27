import random
import time
import os

colors = [31, 32, 33, 34, 35, 36]

while True:
    x = random.randint(1, 40)
    y = random.randint(1, 80)
    color = random.choice(colors)
    
    print("\033[%d;%dH\033[%dm*\033[0m" % (x, y, color))
    print("\033[%d;%dH\033[%dm*\033[0m" % (x+1, y+1, color))
    print("\033[%d;%dH\033[%dm*\033[0m" % (x-1, y-1, color))
    time.sleep(0.05)

