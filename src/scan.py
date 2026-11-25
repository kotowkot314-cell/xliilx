import os
import subprocess
from .utils import run

def android_wifi_passwords():
    """Пытается вытащить сохраненные пароли на Android (нужен root)."""
    paths = [
        "/data/misc/wifi/WifiConfigStore.xml",
        "/data/misc/wifi/wpa_supplicant.conf",
        "/data/misc/apexdata/com.android.wifi/WifiConfigStore.xml"
    ]
    found = []
    for path in paths:
        if os.path.exists(path):
            try:
                # Пытаемся прочитать (сработает только с root)
                with open(path, "r", errors="ignore") as f:
                    content = f.read()
                    # Ищем SSID и пароли
                    if "SSID" in content:
                        found.append(f"Файл найден: {path}\n{content[:500]}...")
            except PermissionError:
                found.append(f"Нет доступа к {path} (нужен root: su -c 'cat {path}')")
    return found

def scan(interface="wlan0"):
    """Сканирует Wi-Fi сети через iw."""
    rc, out, err = run(["iw", "dev", interface, "scan"], timeout=40)
    if rc != 0:
        # Если iw не работает (Android), пробуем вытащить системные пароли
        err_msg = err.strip() or f"iw вернул код {rc}"
        sys_pass = android_wifi_passwords()
        return [{"error": err_msg, "android_sys": sys_pass}]
    
    networks, cur = [], {}
    for line in out.splitlines():
        s = line.strip()
        if s.startswith("BSS "):
            if cur:
                networks.append(cur)
            cur = {"bssid": s.split()[1]}
        elif s.startswith("SSID:"):
            cur["ssid"] = s.split("SSID:", 1)[1].strip()
        elif s.startswith("signal:"):
            cur["signal"] = s.split("signal:", 1)[1].strip()
        elif "WPA" in s or "RSN" in s:
            cur["security"] = "WPA/WPA2"
    if cur:
        networks.append(cur)
    return networks

def print_scan(interface="wlan0"):
    from rich.console import Console
    from rich.table import Table
    console = Console()
    nets = scan(interface)
    
    if nets and "error" in nets[0]:
        console.print(f"[red]{nets[0]['error']}[/red]")
        if nets[0].get("android_sys"):
            console.print("\n[yellow]Попытка чтения системных файлов:[/yellow]")
            for msg in nets[0]["android_sys"]:
                console.print(f"[cyan]{msg}[/cyan]")
        return
        
    table = Table(title=f"Сети на {interface}")
    table.add_column("SSID"); table.add_column("BSSID")
    table.add_column("Signal"); table.add_column("Security")
    for n in nets:
        table.add_row(n.get("ssid", "?"), n.get("bssid", "?"),
                      n.get("signal", "?"), n.get("security", "?"))
    console.print(table)