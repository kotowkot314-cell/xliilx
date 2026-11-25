import os
from rich.console import Console

console = Console()

POPULAR = [
    "password", "123456", "12345678", "qwerty", "abc123", "monkey",
    "1234567", "letmein", "trustno1", "dragon", "baseball", "iloveyou",
    "master", "sunshine", "ashley", "bailey", "passw0rd", "shadow",
    "123123", "654321", "superman", "qazwsx", "michael", "football",
    "password1", "password123", "admin", "admin123", "root", "toor",
    "welcome", "welcome1", "login", "passw0rd!", "p@ssw0rd", "qwerty123",
    "1q2w3e4r", "1qaz2wsx", "zaq12wsx", "qwertyuiop", "asdfghjkl",
    "zxcvbnm", "111111", "000000", "121212", "131313", "123321",
    "666666", "777777", "888888", "999999", "123qwe", "qwe123",
    "letmein1", "changeme", "secret", "default", "guest", "test",
    "internet", "wireless", "wifi", "router", "netgear", "linksys",
    "dlink", "tplink", "asus", "belkin", "cisco", "ubiquiti",
    "homewifi", "mywifi", "family", "love", "honey", "angel",
]

def gen_numeric(out_path, start=1, end=99999999, width=8):
    """Режим 1: перебор 00000001..99999999. Пишет по одному в строке."""
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    total = end - start + 1
    console.print(f"[cyan]Генерация {total:,} паролей в {out_path}...[/cyan]")
    with open(out_path, "w", encoding="utf-8") as f:
        for i in range(start, end + 1):
            f.write(f"{i:0{width}d}\n")
            if i % 1_000_000 == 0:
                console.print(f"[dim]{i:,}/{end:,}[/dim]")
    size_gb = os.path.getsize(out_path) / (1024**3)
    console.print(f"[green]Готово: {out_path} ({size_gb:.2f} GB)[/green]")
    return out_path

def gen_popular(out_path, extra=None):
    """Режим 2: популярные фразы + опциональные дополнения."""
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    words = list(POPULAR)
    if extra:
        words.extend(extra)
    # убираем дубликаты, сохраняя порядок
    seen, uniq = set(), []
    for w in words:
        if w not in seen:
            seen.add(w)
            uniq.append(w)
    with open(out_path, "w", encoding="utf-8") as f:
        for w in uniq:
            f.write(w + "\n")
    console.print(f"[green]Готово: {out_path} ({len(uniq)} паролей)[/green]")
    return out_path