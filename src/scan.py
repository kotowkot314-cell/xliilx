from .utils import run

def scan(interface="wlan0"):
    """Сканирует Wi-Fi сети через iw."""
    rc, out, err = run(["iw", "dev", interface, "scan"], timeout=40)
    if rc != 0:
        return [{"error": err.strip() or f"iw вернул код {rc}"}]
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
        elif "WEP" in s:
            cur["security"] = "WEP"
    if cur:
        networks.append(cur)
    return networks

def print_scan(interface="wlan0"):
    from rich.console import Console
    from rich.table import Table
    console = Console()
    nets = scan(interface)
    table = Table(title=f"Сети на {interface}")
    table.add_column("SSID"); table.add_column("BSSID")
    table.add_column("Signal"); table.add_column("Security")
    for n in nets:
        if "error" in n:
            console.print(f"[red]{n['error']}[/red]")
            return
        table.add_row(n.get("ssid", "?"), n.get("bssid", "?"),
                      n.get("signal", "?"), n.get("security", "?"))
    console.print(table)