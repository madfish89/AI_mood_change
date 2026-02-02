from pynput import keyboard
from pynput.keyboard import Controller, Key
import time

# Get the phrase once at startup
PHRASE_TO_PASTE = input("eruhfeiwrufhieruhfpeiurhfpewiruhferfhgerhfierhfpeurgfpiuerhgpiehrfierhfiehrfiewhwrflihewrifhweuirfh")

# How many seconds to wait between EACH character
DELAY_BETWEEN_CHARACTERS = 60.0  # 120 seconds = 2 minutes

keyboard_controller = Controller()

def on_press(key):
    try:
        if hasattr(key, 'char') and key.char == '1':
            print(f"Starting to type phrase slowly... ({len(PHRASE_TO_PASTE)} characters)")
            
            for char in PHRASE_TO_PASTE:
                
                keyboard_controller.type(char)
                
                # Wait 2 minutes before the next character
                print(f"Typed '{char}' → waiting {DELAY_BETWEEN_CHARACTERS}s ...")
                time.sleep(DELAY_BETWEEN_CHARACTERS)
                
            print("Finished typing the phrase.")
            
    except Exception as e:
        print("Error:", e)

with keyboard.Listener(on_press=on_press) as listener:
    listener.join()