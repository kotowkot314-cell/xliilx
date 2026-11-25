import argparse
from rich.console import Console
from . import scan as scan_mod
from . import capture as cap_mod
from . import crack as crack_mod
from . import anonymize as anon_mod
from . import wordgen as wg_mod
from . import ir_remote as ir_mod

console = Console()

def build_parser():
    p = argparse.ArgumentParser(prog="rocket", description="ROCKET Toolkit")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("scan", help="Сканировать сети или вытащить пароли на Android")
    s.add_argument("-i", "--interface", default="wlan0")

    c = sub.add_parser("capture", help="Захватить handshake")
    c.add_argument("-i", "--interface", required=True)
    c.add_argument("-b", "--bssid", required=True)
    c.add_argument("-o", "--out", default="capture")
    c.add_argument("-c", "--channel", type=int)
    c.add_argument("-d", "--duration", type=int, default=60)

    k = sub.add_parser("crack", help="Проверить словарём")
    k.add_argument("-f", "--file", required=True)
    k.add_argument("-w", "--wordlist", required=True)

    a = sub.add_parser("anonymize", help="Анонимизация")
    a.add_argument("--tor", action="store_true")
    a.add_argument("--mac")

    w = sub.add_parser("wordgen", help="Генерация словаря")
    w.add_argument("mode", choices=["1", "2"])
    w.add_argument("-o", "--out", default="wordlists/generated.txt")
    w.add_argument("--start", type=int, default=1)
    w.add_argument("--end", type=int, default=99999999)
    w.add_argument("--extra", nargs="*")

    ir = sub.add_parser("ir", help="ИК-пульт (Flipper Zero)")
    ir.add_argument("device", choices=["samsung", "lg", "sony"], help="Устройство")
    ir.add_argument("action", choices=["power", "vol_up", "vol_down"], help="Действие")
    ir.add_argument("--list", action="store_true", help="Показать коды")

    return p

def main():
    args = build_parser().parse_args()
    if args.cmd == "scan":
        scan_mod.print_scan(args.interface)
    elif args.cmd == "capture":
        console.print(cap_mod.capture(args.interface, args.bssid, args.out, args.channel, args.duration))
    elif args.cmd == "crack":
        r = crack_mod.crack(args.file, args.wordlist)
        if r.get("found"):
            console.print(f"[green]Пароль: {r['found']}[/green]")
        elif "error" in r:
            console.print(f"[red]{r['error']}[/red]")
        else:
            console.print("[yellow]Пароль не найден[/yellow]")
    elif args.cmd == "anonymize":
        if args.tor: console.print(anon_mod.enable_tor())
        if args.mac: console.print(anon_mod.change_mac(args.mac))
    elif args.cmd == "wordgen":
        if args.mode == "1":
            wg_mod.gen_numeric(args.out, args.start, args.end)
        else:
            wg_mod.gen_popular(args.out, args.extra)
    elif args.cmd == "ir":
        if args.list:
            console.print(ir_mod.list_codes())
        else:
            res = ir_mod.send_preset(args.device, args.action)
            console.print(res)

if __name__ == "__main__":
    main()