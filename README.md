# 🎵 Push Tags — VS Code Extension

Push Tags is a lightweight VS Code extension that plays custom producer tags or sound effects when you push your Git actions inside the integrated terminal.

*Alert everyone you know that you have pushed code with creative flair*
---

## 🚀 Features

* 🔊 Play sound when you run `git push` in the VS Code terminal
* 🎵 Choose from built-in sounds
* 📁 Upload custom audio files (`.mp3`, `.wav`, `.m4a`)
* 🚫 Disable sounds anytime
* ⚡ Lightweight and runs locally inside VS Code

---

## 📦 Installation

### Option 1: Install from VSIX

1. Download the `.vsix` file
2. Open VS Code
3. Press `Cmd/Ctrl + Shift + P`
4. Run: **Extensions: Install from VSIX**
5. Select the file

---

## 🎮 How to Use

### 1. Open Command Palette

```
Cmd/Ctrl + Shift + P
```

### 2. Run:

```
Push Tags: Select Sound
```

### 3. Choose one:

* 🎵 Built-in sound
* 🔉 Custom uploaded sound
* 📁 Open sound folder
* 🚫 Disable sound effects

---

## 🔊 How Sound Trigger Works

The extension listens for terminal commands inside VS Code.

When it detects:

```
git push
```

It plays the selected sound effect.

---

## 📁 Custom Sounds

You can upload your own sounds:

* Supported formats: `.mp3`, `.wav`, `.m4a`
* Stored in VS Code global extension storage

Access folder via:

```
Push Tags → Open Custom Sounds Folder
```

---

## ⚙️ Requirements

* VS Code `^1.116.0` or higher
* Git installed on system
* Terminal usage inside VS Code

---

## 🧠 Notes

* Only detects Git commands run inside VS Code terminal
* Does NOT detect external Git clients (GitHub Desktop, CLI outside VS Code)
* Sound playback depends on OS:

  * macOS → `afplay`
  * Windows → PowerShell SoundPlayer
  * Linux → `ffplay`

---

## ⚠️ Known Limitations

* Terminal-based detection only
* Linux requires `ffmpeg` installed for sound playback
* No background Git monitoring (yet)

---

## 🛠️ Future Improvements

* Real Git API event detection (no terminal parsing)
* Per-repo sound profiles
* Smarter event filtering (push/pull/commit)
* Faster audio playback engine

---

## 💡 Why this exists

This extension is designed to make development feel more interactive and fun by adding audio feedback to Git actions.

---

*built with ❤️ by rishaan*
**https://rishaan.cc**

