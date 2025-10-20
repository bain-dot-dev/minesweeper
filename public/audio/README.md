# Audio Assets Directory

This directory contains all audio assets for the Mission Impossible Minesweeper game.

## 📁 Directory Structure

```
audio/
├── sfx/                    # Sound Effects
│   ├── ui/                # User Interface sounds
│   │   ├── click_tactical.mp3
│   │   ├── hover_soft.mp3
│   │   ├── button_press.mp3
│   │   ├── switch_toggle.mp3
│   │   └── difficulty_change.mp3
│   │
│   ├── gameplay/          # Game interaction sounds
│   │   ├── reveal_digital.mp3
│   │   ├── flag_place.mp3
│   │   ├── flag_remove.mp3
│   │   ├── cascade_whoosh.mp3
│   │   ├── safe_beep.mp3
│   │   └── numbers/       # Number reveal sounds (1-8)
│   │       ├── beep_1.mp3
│   │       ├── beep_2.mp3
│   │       ├── beep_3.mp3
│   │       ├── beep_4.mp3
│   │       ├── beep_5.mp3
│   │       ├── beep_6.mp3
│   │       ├── beep_7.mp3
│   │       └── beep_8.mp3
│   │
│   ├── danger/            # Danger and explosion sounds
│   │   ├── explosion_big.mp3
│   │   ├── warning_beep.mp3
│   │   ├── countdown_tick.mp3
│   │   ├── alarm_warning.mp3
│   │   └── heartbeat_fast.mp3
│   │
│   └── success/           # Victory and achievement sounds
│       ├── victory_fanfare.mp3
│       ├── achievement_chime.mp3
│       ├── streak_sound.mp3
│       └── mission_complete.mp3
│
└── music/                 # Background Music
    ├── menu_theme.mp3
    ├── gameplay_ambient.mp3
    ├── danger_tension.mp3
    └── victory_theme.mp3
```

## 🚀 Getting Started

**This directory is currently empty!** To add audio files:

1. **Read the guide**: See `/docs/AUDIO_RESOURCE_GUIDE.md` for detailed instructions
2. **Create folders**: Create the directory structure shown above
3. **Add audio files**: Download or generate audio files following the guide
4. **Update credits**: Fill in `CREDITS.md` with proper attribution
5. **Test**: Launch the game and verify audio works

## ⚡ Quick Setup Options

### Option 1: Use the Setup Script (Coming Soon)
```bash
npm run setup:audio
```

### Option 2: Manual Setup
1. Create all folders from the structure above
2. Follow the Audio Resource Guide to collect files
3. Place files in their respective folders
4. Verify file paths match exactly

### Option 3: Generate Placeholder Sounds
Use Bfxr (https://www.bfxr.net/) to quickly generate all sounds:
- UI sounds: Use "Click/Switch" presets
- Numbers: Use "Pickup" preset with different pitches
- Explosions: Use "Explosion" preset
- Success: Use "Powerup" presets

## 📝 File Naming Conventions

- **All lowercase** with underscores
- **No spaces** in filenames
- **MP3 format** (128-192 kbps)
- **Descriptive names**: `action_description.mp3`

Examples:
- ✅ `click_tactical.mp3`
- ❌ `Click-Tactical.MP3`
- ❌ `click tactical.mp3`

## 🎵 Audio Specifications

| Type | Format | Bitrate | Sample Rate | Max Size |
|------|--------|---------|-------------|----------|
| UI SFX | MP3 | 128 kbps | 44.1 kHz | 50 KB |
| Game SFX | MP3 | 128-192 kbps | 44.1 kHz | 200 KB |
| Music | MP3 | 192 kbps | 44.1 kHz | 3 MB |

## ⚠️ Important Notes

- **Do NOT commit copyrighted audio** without proper licensing
- **Always check licenses** before adding files
- **Update CREDITS.md** when adding new audio
- **Test on mobile** - audio behaves differently
- **Keep file sizes small** - impacts load time

## 🔍 Troubleshooting

### Audio not playing?
1. Check browser console for 404 errors
2. Verify file paths match exactly (case-sensitive)
3. Ensure files are MP3 format
4. Check if browser autoplay is blocked
5. Test with browser developer tools

### Files too large?
- Use Audacity to reduce bitrate
- Trim silence from start/end
- Convert stereo to mono for SFX
- Consider audio sprites for many small sounds

### Mobile issues?
- Ensure audio unlocking is working (requires user interaction)
- Test on real devices, not just simulators
- Check iOS Safari specifically (most restrictive)

## 📚 Resources

- **Collection Guide**: `/docs/AUDIO_RESOURCE_GUIDE.md`
- **Credits Template**: `CREDITS.md`
- **Config File**: `/src/lib/audio/audio-config.ts`
- **Manager**: `/src/lib/audio/AudioManager.ts`

## 🎯 Required Files Checklist

Track your progress:

### UI Sounds (5 files)
- [ ] click_tactical.mp3
- [ ] hover_soft.mp3
- [ ] button_press.mp3
- [ ] switch_toggle.mp3
- [ ] difficulty_change.mp3

### Gameplay Sounds (5 files + 8 numbers)
- [ ] reveal_digital.mp3
- [ ] flag_place.mp3
- [ ] flag_remove.mp3
- [ ] cascade_whoosh.mp3
- [ ] safe_beep.mp3
- [ ] beep_1.mp3 through beep_8.mp3

### Danger Sounds (5 files)
- [ ] explosion_big.mp3
- [ ] warning_beep.mp3
- [ ] countdown_tick.mp3
- [ ] alarm_warning.mp3
- [ ] heartbeat_fast.mp3

### Success Sounds (4 files)
- [ ] victory_fanfare.mp3
- [ ] achievement_chime.mp3
- [ ] streak_sound.mp3
- [ ] mission_complete.mp3

### Music (4 files)
- [ ] menu_theme.mp3
- [ ] gameplay_ambient.mp3
- [ ] danger_tension.mp3
- [ ] victory_theme.mp3

**Total: 31 audio files needed**

## 🤝 Contributing

When adding audio:
1. Follow the file structure exactly
2. Use correct naming conventions
3. Add proper attribution to CREDITS.md
4. Test the audio works in-game
5. Update this checklist if adding new sounds

## 📖 License Information

All audio in this directory must be:
- Properly licensed for use in this project
- Attributed according to license requirements
- Documented in CREDITS.md

See CREDITS.md for full attribution details.

---

**Need help?** Check the Audio Resource Guide or open an issue on GitHub.
