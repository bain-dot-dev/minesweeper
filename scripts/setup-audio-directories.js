/**
 * Audio Directory Setup Script
 * Creates the required directory structure for audio assets
 *
 * Run with: node scripts/setup-audio-directories.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.join(__dirname, '..', 'public', 'audio');

const DIRECTORIES = [
  'sfx/ui',
  'sfx/gameplay',
  'sfx/gameplay/numbers',
  'sfx/danger',
  'sfx/success',
  'music',
];

const PLACEHOLDER_FILES = {
  'sfx/ui': [
    'click_tactical.mp3',
    'hover_soft.mp3',
    'button_press.mp3',
    'switch_toggle.mp3',
    'difficulty_change.mp3',
  ],
  'sfx/gameplay': [
    'reveal_digital.mp3',
    'flag_place.mp3',
    'flag_remove.mp3',
    'cascade_whoosh.mp3',
    'safe_beep.mp3',
  ],
  'sfx/gameplay/numbers': [
    'beep_1.mp3',
    'beep_2.mp3',
    'beep_3.mp3',
    'beep_4.mp3',
    'beep_5.mp3',
    'beep_6.mp3',
    'beep_7.mp3',
    'beep_8.mp3',
  ],
  'sfx/danger': [
    'explosion_big.mp3',
    'warning_beep.mp3',
    'countdown_tick.mp3',
    'alarm_warning.mp3',
    'heartbeat_fast.mp3',
  ],
  'sfx/success': [
    'victory_fanfare.mp3',
    'achievement_chime.mp3',
    'streak_sound.mp3',
    'mission_complete.mp3',
  ],
  'music': [
    'menu_theme.mp3',
    'gameplay_ambient.mp3',
    'danger_tension.mp3',
    'victory_theme.mp3',
  ],
};

function createDirectories() {
  console.log('🎵 Setting up audio directory structure...\n');

  // Create base directory
  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
    console.log('✅ Created base audio directory');
  }

  // Create subdirectories
  let dirCount = 0;
  DIRECTORIES.forEach((dir) => {
    const fullPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
      dirCount++;
    } else {
      console.log(`⏭️  Directory already exists: ${dir}`);
    }
  });

  console.log(`\n📁 Created ${dirCount} new directories`);
}

function createPlaceholders(createFiles = false) {
  if (!createFiles) {
    console.log('\n⚠️  Placeholder file creation skipped (use --create-placeholders to enable)');
    return;
  }

  console.log('\n🎼 Creating placeholder .gitkeep files...\n');

  let fileCount = 0;
  Object.entries(PLACEHOLDER_FILES).forEach(([dir, files]) => {
    const dirPath = path.join(BASE_DIR, dir);

    // Create .gitkeep to preserve empty directories
    const gitkeepPath = path.join(dirPath, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
      console.log(`✅ Created .gitkeep in ${dir}`);
      fileCount++;
    }

    // Create placeholder info file
    const infoPath = path.join(dirPath, 'NEEDED_FILES.txt');
    if (!fs.existsSync(infoPath)) {
      const content = `Required audio files for ${dir}:\n\n${files.map(f => `- ${f}`).join('\n')}\n\nSee /docs/AUDIO_RESOURCE_GUIDE.md for instructions on obtaining these files.`;
      fs.writeFileSync(infoPath, content);
      console.log(`✅ Created NEEDED_FILES.txt in ${dir}`);
      fileCount++;
    }
  });

  console.log(`\n📄 Created ${fileCount} placeholder files`);
}

function generateChecklist() {
  console.log('\n📋 Generating audio file checklist...\n');

  let checklistContent = '# Audio Files Checklist\n\n';
  checklistContent += 'Track your progress in collecting audio files:\n\n';

  Object.entries(PLACEHOLDER_FILES).forEach(([dir, files]) => {
    checklistContent += `## ${dir}\n\n`;
    files.forEach((file) => {
      checklistContent += `- [ ] ${file}\n`;
    });
    checklistContent += '\n';
  });

  const totalFiles = Object.values(PLACEHOLDER_FILES).reduce(
    (sum, files) => sum + files.length,
    0
  );
  checklistContent += `\n**Total: ${totalFiles} audio files needed**\n`;
  checklistContent += '\nSee `/docs/AUDIO_RESOURCE_GUIDE.md` for detailed instructions.\n';

  const checklistPath = path.join(BASE_DIR, 'CHECKLIST.md');
  fs.writeFileSync(checklistPath, checklistContent);
  console.log('✅ Created CHECKLIST.md in public/audio/');
}

function printSummary() {
  const totalFiles = Object.values(PLACEHOLDER_FILES).reduce(
    (sum, files) => sum + files.length,
    0
  );

  console.log('\n' + '='.repeat(60));
  console.log('✨ Audio Setup Complete!');
  console.log('='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   - Directories created: ${DIRECTORIES.length}`);
  console.log(`   - Files needed: ${totalFiles}`);
  console.log('\n📚 Next Steps:');
  console.log('   1. Read: /docs/AUDIO_RESOURCE_GUIDE.md');
  console.log('   2. Check: /public/audio/CHECKLIST.md');
  console.log('   3. Collect audio files from recommended sources');
  console.log('   4. Place files in their respective directories');
  console.log('   5. Update: /public/audio/CREDITS.md');
  console.log('   6. Test in the game!\n');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const createPlaceholderFiles = args.includes('--create-placeholders');

  try {
    createDirectories();
    createPlaceholders(createPlaceholderFiles);
    generateChecklist();
    printSummary();
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
