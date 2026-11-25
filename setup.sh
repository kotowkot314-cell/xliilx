#!/data/data/com.termux/files/usr/bin/bash
# setup.sh

echo "=== УСТАНОВКА  ==="

# 1. Установка базовых пакетов (Termux)
pkg update -y && pkg upgrade -y
pkg install -y git python python-pip

# 2. Клонирование (если запущен не из папки репозитория)
if [ ! -d "src" ]; then
    echo "Клонирование репозитория..."
    git clone https://github.com/kotowkot314-cell/xliilx.git
    cd xliilx || exit 1
fi

# 3. Установка остальных пакетов
echo "Установка системных пакетов..."
pkg install -y root-repo tur-repo iw tor proxychains-ng macchanger v4l-utils

# 4. Aircrack-ng ()
if ! command -v aircrack-ng &> /dev/null; then
    echo "Установка aircrack-ng..."
    git clone https://github.com/ShellCrafter/aircrack-termux.git /tmp/ac
    cd /tmp/ac && bash install.sh && cd - > /dev/null
fi

# 5. Hashcat (через скрипт)
if ! command -v hashcat &> /dev/null; then
    echo "Установка hashcat..."
    curl -sL https://github.com/Anon4You/hashcat-in-termux/raw/main/hashcat.sh | bash
fi

# 6. Python-зависимости
echo "Установка Python библиотек..."
pip install rich requests

# 7. Создание папок и словарей
mkdir -p wordlists captures ir_db
if [ ! -f "wordlists/popular.txt" ]; then
    echo "Создание стартового словаря..."
    python -m src.main wordgen 2 -o wordlists/popular.txt
fi

# 8. Создание ярлыка для запуска (алиас)
echo "Создание команды 'rocket'..."
echo '#!/data/data/com.termux/files/usr/bin/bash
cd ~/xliilx 2>/dev/null || cd $(dirname $0)
python -m src.main "$@"' > $PREFIX/bin/rocket
chmod +x $PREFIX/bin/rocket

echo "=== ГОТОВО!"