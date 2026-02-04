import os
import json
import threading
import urllib.parse
import subprocess
import shutil
from http.server import BaseHTTPRequestHandler, HTTPServer
from config import BACKUP_ROOT, SERVER_PORT, STEAM_PATH


class CalyRequestHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/check_restore':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            flag_file = os.path.join(BACKUP_ROOT, "sucesso.flag")
            restored = os.path.exists(flag_file)

            if restored:
                try:
                    os.remove(flag_file)
                except:
                    pass

            self.wfile.write(json.dumps({"restored": restored}).encode())

        elif self.path == '/list':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            backups = []

            if os.path.exists(BACKUP_ROOT):
                for d in sorted(os.listdir(BACKUP_ROOT), reverse=True):
                    p = os.path.join(BACKUP_ROOT, d)
                    if os.path.isdir(p) and d.startswith("VOIDㅤ"):
                        meta = {}
                        mp = os.path.join(p, "caly_meta.json")
                        if os.path.exists(mp):
                            try:
                                with open(mp, 'r', encoding='utf-8') as f:
                                    meta = json.load(f)
                            except:
                                pass

                        backups.append({
                            "folder": d,
                            "nickname": meta.get("nickname") or meta.get("name"),
                            "game_name": meta.get("game_name"),
                            "appid": meta.get("appid")
                        })

            self.wfile.write(json.dumps(backups).encode())

        else:
            self.send_error(404)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        self.rfile.read(content_length)

        if self.path.startswith('/restore/'):
            folder = urllib.parse.unquote(self.path.replace('/restore/', ''))

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            threading.Thread(
                target=run_restore_bat,
                args=(folder,),
                daemon=True
            ).start()

        elif self.path == '/restart-steam':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            threading.Thread(
                target=run_restart_steam_bat,
                daemon=True
            ).start()

        else:
            self.send_error(404)

    def do_DELETE(self):
        if self.path.startswith('/delete/'):
            folder = urllib.parse.unquote(self.path.replace('/delete/', ''))
            backup_path = os.path.join(BACKUP_ROOT, folder)

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            try:
                if os.path.exists(backup_path) and os.path.isdir(backup_path):
                    shutil.rmtree(backup_path)
            except Exception as e:
                print("Erro ao excluir backup:", e)

        else:
            self.send_error(404)

    def log_message(self, *args):
        return


# ================= RESTORE =================

def run_restore_bat(backup_folder):
    backup_src = os.path.join(BACKUP_ROOT, backup_folder)
    steam_exe = os.path.join(STEAM_PATH, "steam.exe")
    flag_file = os.path.join(BACKUP_ROOT, "sucesso.flag")
    bat_path = os.path.join(os.environ["TEMP"], "caly_restore.bat")

    bat = [
        "@echo off",
        "taskkill /F /IM steam.exe >nul 2>&1",
        "timeout /t 2 /nobreak >nul",
        f'set "BACKUP={backup_src}"',
        f'set "STEAM={STEAM_PATH}"',
        'xcopy "%BACKUP%\\userdata\\*" "%STEAM%\\userdata\\" /E /H /C /I /Y /Q >nul 2>&1',
        'xcopy "%BACKUP%\\appcache_stats\\*" "%STEAM%\\appcache\\stats\\" /E /H /C /I /Y /Q >nul 2>&1',
        'xcopy "%BACKUP%\\depotcache\\*" "%STEAM%\\depotcache\\" /E /H /C /I /Y /Q >nul 2>&1',
        f'echo 1 > "{flag_file}"',
        "timeout /t 2 /nobreak >nul",
        f'start "" "{steam_exe}"',
        '(goto) 2>nul & del "%~f0"'
    ]

    try:
        with open(bat_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(bat))

        subprocess.Popen(
            ["cmd", "/c", bat_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
    except:
        pass


# ================= RESTART STEAM =================

def run_restart_steam_bat():
    steam_exe = os.path.join(STEAM_PATH, "steam.exe")
    bat_path = os.path.join(os.environ["TEMP"], "caly_restart_steam.bat")

    bat = [
        "@echo off",
        "taskkill /F /IM steam.exe >nul 2>&1",
        "timeout /t 2 /nobreak >nul",
        f'start "" "{steam_exe}"',
        '(goto) 2>nul & del "%~f0"'
    ]

    try:
        with open(bat_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(bat))

        subprocess.Popen(
            ["cmd", "/c", bat_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
    except:
        pass


# ================= SERVER =================

def start_server():
    server_address = ('127.0.0.1', SERVER_PORT)
    httpd = HTTPServer(server_address, CalyRequestHandler)
    httpd.serve_forever()
