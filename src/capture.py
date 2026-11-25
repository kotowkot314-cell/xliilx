import os
from .utils import run, require_root

def capture(interface, bssid, out_prefix, channel=None, duration=60):
    """Захват handshake через aircrack-ng suite. Требует root и monitor mode."""
    require_root()
    os.makedirs("captures", exist_ok=True)
    prefix = os.path.join("captures", out_prefix)

    # 1.
    run(["airmon-ng", "start", interface])
    mon = interface + "mon"
    # на некоторых системах имя меняется — проверим
    rc, out, _ = run(["iw", "dev"])
    if mon not in out:
        for line in out.splitlines():
            if "Interface" in line:
                mon = line.split()[-1]
                break

    # 2. 
    if channel:
        run(["iw", "dev", mon, "set", "channel", str(channel)])

    # 3.
    rc, out, err = run(
        ["airodump-ng", "-c", str(channel) if channel else "1",
         "--bssid", bssid, "-w", prefix, mon],
        timeout=duration
    )
    run(["airmon-ng", "stop", mon])
    caps = [f for f in os.listdir("captures") if f.startswith(out_prefix) and f.endswith(".cap")]
    if not caps:
        return {"error": "Handshake не захвачен. Убедитесь, что клиент подключается к сети."}
    return {"cap": os.path.join("captures", caps[0])}