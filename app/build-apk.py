"""Rebuild the MND CODE Android APK from the current website files.

Takes the Capacitor shell APK (app/MND-CODE-debug.apk), replaces the bundled
website in assets/public/ with the site in the repo root, then zipaligns and
signs the result with app/mnd-debug.keystore (created on first run).

Usage:  python app/build-apk.py
Needs:  Java (keytool) on PATH. Android build-tools r36 are downloaded once
        (~58 MB, SHA-1 verified) into %LOCALAPPDATA%/mnd-apk-tools.
"""
import hashlib, os, shutil, subprocess, sys, urllib.request, zipfile
from pathlib import Path

APP = Path(__file__).resolve().parent
SITE = APP.parent
BASE_APK = APP / "MND-CODE-debug.apk"
OUT_APK = APP / "MND-CODE-debug-v2.apk"
KEYSTORE = APP / "mnd-debug.keystore"
KS_PASS, KEY_ALIAS = "android", "mnddebug"

TOOLS = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "mnd-apk-tools"
BT_URL = "https://dl.google.com/android/repository/build-tools_r36_windows.zip"
BT_SHA1 = "f16ccffd34de8790dede813a6c7d8e2c11a27b50"

# Website files bundled into the app (PDFs are left out: the WebView can't open them)
SKIP_HTML = {"original-single-file.html", "mock-test.html"}
KEEP_FROM_BASE = {"assets/public/cordova.js", "assets/public/cordova_plugins.js"}


def build_tools():
    bt = TOOLS / "android-16"
    if (bt / "zipalign.exe").exists():
        return bt
    TOOLS.mkdir(parents=True, exist_ok=True)
    zpath = TOOLS / "build-tools.zip"
    print("Downloading Android build-tools r36 ...")
    urllib.request.urlretrieve(BT_URL, zpath)
    if hashlib.sha1(zpath.read_bytes()).hexdigest() != BT_SHA1:
        zpath.unlink()
        sys.exit("build-tools download failed its SHA-1 check")
    with zipfile.ZipFile(zpath) as z:
        z.extractall(TOOLS)
    zpath.unlink()
    return bt


def site_files():
    files = [p for p in SITE.glob("*.html") if p.name not in SKIP_HTML]
    files += [p for p in (SITE / "assets").rglob("*") if p.is_file()]
    return sorted(files)


def repack(unsigned):
    with zipfile.ZipFile(BASE_APK) as src, zipfile.ZipFile(unsigned, "w") as dst:
        for info in src.infolist():
            name = info.filename
            if name.startswith("META-INF/") and name.rsplit(".", 1)[-1] in ("SF", "RSA", "EC", "DSA", "MF"):
                continue  # old signature
            if name.startswith("assets/public/") and name not in KEEP_FROM_BASE:
                continue  # old website
            dst.writestr(info, src.read(name))  # keeps each entry's original compression
        for f in site_files():
            arc = "assets/public/" + f.relative_to(SITE).as_posix()
            dst.write(f, arc, compress_type=zipfile.ZIP_DEFLATED)
            print("  +", arc)


def ensure_keystore():
    if KEYSTORE.exists():
        return
    subprocess.run(["keytool", "-genkeypair", "-keystore", str(KEYSTORE), "-storepass", KS_PASS, "-keypass", KS_PASS,
                    "-alias", KEY_ALIAS, "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
                    "-dname", "CN=MND CODE Debug, O=MND CODE, C=IN"], check=True)


def main():
    bt = build_tools()
    ensure_keystore()
    unsigned, aligned = APP / "_unsigned.apk", APP / "_aligned.apk"
    try:
        repack(unsigned)
        subprocess.run([str(bt / "zipalign.exe"), "-f", "-p", "4", str(unsigned), str(aligned)], check=True)
        subprocess.run([str(bt / "apksigner.bat"), "sign", "--ks", str(KEYSTORE), "--ks-pass", "pass:" + KS_PASS,
                        "--ks-key-alias", KEY_ALIAS, "--v4-signing-enabled", "false", "--out", str(OUT_APK), str(aligned)], check=True)
        subprocess.run([str(bt / "apksigner.bat"), "verify", "--verbose", str(OUT_APK)], check=True)
    finally:
        for f in (unsigned, aligned):
            f.unlink(missing_ok=True)
    print(f"\nBuilt {OUT_APK} ({OUT_APK.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
