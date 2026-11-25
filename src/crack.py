import os
from .utils import run

def crack(cap_file, wordlist):
    """Офлайн-проверка handshake словарём через aircrack-ng."""
    if not os.path.exists(cap_file):
        return {"error": f"Файл не найден: {cap_file}"}
    if not os.path.exists(wordlist):
        return {"error": f"Словарь не найден: {wordlist}"}
    rc, out, err = run(
        ["aircrack-ng", "-w", wordlist, "-b", "", cap_file],
        timeout=3600
    )
    # 
    key = None
    for line in out.splitlines():
        if "KEY FOUND" in line:
            key = line.split("KEY FOUND!", 1)[1].strip()
            break
    return {"found": key, "raw": out, "rc": rc}