# Waveflow Deck

Control [WaveFlow](https://github.com/InstaZDLL/WaveFlow) from your Elgato Stream Deck, without relying on the system media keys.

> **Unofficial plugin.** Waveflow Deck is an independent project. It is not affiliated with, endorsed by, or sponsored by the WaveFlow project or by Elgato.

## Why this exists

Stream Deck's built-in media buttons send the operating system's media keys, and whichever app grabs them first wins. Video editors, games and browsers often do, so your "next track" button ends up doing something else.

Waveflow Deck talks to WaveFlow directly through its built-in **MPD server**. The buttons always reach WaveFlow, no window is focused, and no scripts are launched.

## Features

- **Play / Pause**
- **Next** and **Previous** track
- **Volume**: one action, configured per button. Choose *Increase* or *Decrease* and a step from 1 to 50 %. It changes WaveFlow's own in-app volume, not the Windows volume mixer. Add as many volume buttons as you like, each with its own step.
- **One-time connection setup**: address, port and password are entered once and shared by every action.
- A **yellow warning triangle** appears on the key when WaveFlow can't be reached.

## Requirements

- [WaveFlow](https://github.com/InstaZDLL/WaveFlow) with the MPD server option (see the [WaveFlow MPD documentation](https://github.com/InstaZDLL/WaveFlow/blob/main/docs/features/mpd.md)).
- Stream Deck software **7.1** or newer.
- Windows 10 or newer (tested on Windows 11). macOS 12+ is declared in the manifest but has **not been tested**.

## Setup

1. **Enable the MPD server in WaveFlow:** *Settings → Connections → Network sharing → MPD server*. Turn it on, set a **password**, and note the address and port shown next to the running status (the default port is `6600`).
2. **Install the plugin:** download the latest `.streamDeckPlugin` file from the [Releases](../../releases) page and double-click it.
3. In the Stream Deck app, open the **Waveflow Deck** category and drag the actions you want onto your keys.
4. Select any Waveflow Deck key and fill in **Address (IP)**, **Port** and **Password** in the panel at the bottom. These settings are global, so you only do this once.
5. For a **Volume** key, pick *Increase* or *Decrease* and set the step.

## Troubleshooting

A yellow triangle on a key means the plugin could not talk to WaveFlow.

- Make sure WaveFlow is running and the **MPD server is turned on**.
- Use the **address and port that WaveFlow displays** next to its running status. On the same PC, `127.0.0.1` should also work.
- Check that the **password** matches the one set in WaveFlow.
- On Windows, you can test the connection from PowerShell: `Test-NetConnection <address> -Port 6600`. `TcpTestSucceeded : True` means the server is reachable.
- If you control WaveFlow from another computer, make sure your firewall allows the port.
- Plugin logs are in the plugin's `logs` folder inside Stream Deck's plugins directory (on Windows: `%APPDATA%\Elgato\StreamDeck\Plugins\com.sylv.waveflow-deck.sdPlugin\logs`).

## Security note

The MPD protocol sends commands and the password in **plain text**, and WaveFlow's MPD server is reachable from your local network. Set a password and only use this on a network you trust. The password is stored in Stream Deck's global plugin settings and is not additionally encrypted by this plugin.

## Building from source

Requirements: Node.js 24 or newer and the Stream Deck software 7.1 or newer.

```bash
npm install -g @elgato/cli
npm install
npm run build       # compile once
npm run watch       # rebuild and restart the plugin on changes
streamdeck validate com.sylv.waveflow-deck.sdPlugin
streamdeck pack com.sylv.waveflow-deck.sdPlugin   # creates the .streamDeckPlugin installer
```

On Windows, if the `streamdeck` command is blocked by PowerShell's execution policy, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once.

## How it works

Each button press opens a short TCP connection to WaveFlow's MPD server, authenticates with the password, sends one command (`pause`, `next`, `previous` or `setvol`), and closes the connection. Nothing runs in the background and nothing is sent anywhere except to the address you configured.

## AI disclosure

This plugin was developed with the help of AI (Anthropic's Claude). The code, this documentation and the simple action icons were written with AI assistance. The plugin icon artwork is original work by the author.

## License

Released under the [MIT License](LICENSE).

## Disclaimer

WaveFlow is a project by its own authors, and "Stream Deck" and "Elgato" are trademarks of their respective owners. They are mentioned here only to describe what this plugin works with.
