import os
import subprocess
from .utils import run

# Пример базы ИК-кодов (можно расширять)
IR_CODES = {
    "samsung_power": "0xE0E040BF",
    "samsung_vol_up": "0xE0E0E01F",
    "samsung_vol_down": "0xE0E0D02F",
    "lg_power": "0x20DF10EF",
    "lg_vol_up": "0x20DF40BF",
    "lg_vol_down": "0x20DFC03F",
    "sony_power": "0xA90",
}

def send_ir(code_hex):
    """Отправляет ИК-сигнал через ir-ctl (нужен ИК-порт)."""
    # ir-ctl требует указания устройства, обычно /dev/lirc0
    if not os.path.exists("/dev/lirc0"):
        return {"error": "ИК-порт не найден (/dev/lirc0). Нужен телефон с ИК-портом."}
        
    # Конвертируем hex в формат scancode, понятный ir-ctl
    try:
        scancode = int(code_hex, 16)
        # Пример использования: ir-ctl -d /dev/lirc0 --send=...
        # В реальности формат зависит от драйвера, часто нужен lircd
        cmd = ["ir-ctl", "-d", "/dev/lirc0", "--send", hex(scancode)]
        rc, out, err = run(cmd, timeout=10)
        if rc != 0:
            return {"error": f"Ошибка отправки: {err}"}
        return {"status": "Сигнал отправлен"}
    except Exception as e:
        return {"error": str(e)}

def list_codes():
    return IR_CODES

def send_preset(device, action):
    key = f"{device}_{action}"
    if key not in IR_CODES:
        return {"error": f"Код {key} не найден"}
    return send_ir(IR_CODES[key])