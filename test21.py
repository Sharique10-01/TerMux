import platform
import time

print("🔥 Python is working in Termux!")
print("-------------------------------")

print(f"Python Version     : {platform.python_version()}")
print(f"Operating System   : {platform.system()}")
print(f"Release Version    : {platform.release()}")
print(f"Machine            : {platform.machine()}")

print("\nRunning a quick loop test:")
for i in range(1, 6):
    print(f"Counting {i}...")
    time.sleep(0.5)

print("\n🎉 All tests completed!")
