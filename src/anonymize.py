from .utils import run, require_root

def enable_tor():
    rc, _, err = run(["pgrep", "-x", "tor"])
    if rc == 0:
        return {"status": "Tor уже запущен"}
    rc, out, err = run(["tor", "--daemon"], timeout=30)
    if rc != 0:
        return {"error": err}
    return {"status": "Tor запущен. Используйте: proxychains4 <cmd>"}

def change_mac(interface):
    require_root()
    run(["ip", "link", "set", interface, "down"])
    rc, out, err = run(["macchanger", "-r", interface])
    run(["ip", "link", "set", interface, "up"])
    if rc != 0:
        return {"error": err}
    return {"status": out.strip()}