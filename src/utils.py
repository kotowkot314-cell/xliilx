import subprocess

def run(cmd, timeout=60):
    """Запускает команду, возвращает (rc, stdout, stderr)."""
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout, p.stderr
    except FileNotFoundError:
        return 127, "", f"Команда не найдена: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", f"Таймаут: {' '.join(cmd)}"

def require_root():
    import os
    if os.geteuid() != 0:
        raise PermissionError("Требуется root. Запустите через sudo или su.")