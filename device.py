import json
import os

def termux_cmd(command):
    try:
        result = os.popen(command).read()
        return json.loads(result) if result else {}
    except:
        return {}

print("===============================================")
print("          📱 ANDROID DEVICE INFORMATION        ")
print("===============================================\n")

# Device Info
device = termux_cmd("termux-info")
print("🔥 DEVICE INFO 🔥")
print(device.get("device_model", "Unknown Device"))
print()

# Battery Status
battery = termux_cmd("termux-battery-status")
print("🔋 BATTERY")
print(f"Percentage       : {battery.get('percentage')}%")
print(f"Charging         : {battery.get('plugged')}")
print(f"Health           : {battery.get('health')}")
print()

# WiFi Info
wifi = termux_cmd("termux-wifi-connectioninfo")
print("📡 WIFI")
print(f"SSID             : {wifi.get('ssid')}")
print(f"IP Address       : {wifi.get('ip')}")
print(f"Link Speed       : {wifi.get('link_speed')} Mbps")
print()

# Storage Info
storage = termux_cmd("termux-storage-get")
print("💾 STORAGE")
print(storage)
print()

# Audio Info
audio = termux_cmd("termux-volume")
print("🔊 VOLUME LEVELS")
for key, value in audio.items():
    print(f"{key.capitalize():15}: {value['volume']}/{value['max_volume']}")
print()

# Brightness
brightness = os.popen("termux-brightness").read().strip()
print("🔆 BRIGHTNESS")
print(f"Level: {brightness}")
print()

print("===============================================")
print("             ✔ DEVICE CHECK COMPLETE           ")
print("===============================================\n")
