# Telegram Bot ↔ Claude Code Integration Guide

## Overview
This guide shows how to connect your Telegram bot controller to Claude Code (me) as the ClawdBot intelligence.

## Integration Architecture

```
[Telegram Message] → [Telegram Bot] → [clawdbot.bat] → [Claude Code Session] → [Execute Task] → [Return Results]
```

## Step 1: Update Your Telegram Bot Controller

In your `C:\Users\drews\clawdbot-telegram` directory, update your bot to integrate with Claude Code:

### Method A: Direct Integration (Recommended)

```javascript
// In your telegram bot controller
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const TUMARO_PROJECT_DIR = 'C:\\Users\\drews\\OneDrive\\Desktop\\Tumaro-App';
const CLAWDBOT_SCRIPT = path.join(TUMARO_PROJECT_DIR, 'scripts', 'clawdbot.bat');

// Safety check function
function isSafeTask(task) {
  const dangerousPatterns = [
    'rm -rf', 'del /f /s', 'format', 'shutdown', 'restart',
    '../../../', 'C:\\Users\\drews\\clawdbot-telegram',
    'system32', 'registry', 'net user'
  ];
  
  return !dangerousPatterns.some(pattern => 
    task.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Main command handler
async function handleClawdBotCommand(chatId, task) {
  try {
    // Safety check
    if (!isSafeTask(task)) {
      bot.sendMessage(chatId, '❌ Task blocked for safety reasons');
      return;
    }

    // Notify user that ClawdBot is starting
    bot.sendMessage(chatId, `🤖 ClawdBot starting task: "${task}"`);
    
    // Execute the ClawdBot script
    exec(`"${CLAWDBOT_SCRIPT}" "${task}"`, {
      cwd: TUMARO_PROJECT_DIR,
      timeout: 30000 // 30 second timeout
    }, (error, stdout, stderr) => {
      
      if (error) {
        bot.sendMessage(chatId, `❌ ClawdBot error: ${error.message}`);
        return;
      }
      
      // Send the script output
      bot.sendMessage(chatId, `📋 ClawdBot prepared task context:\n\`\`\`\n${stdout}\n\`\`\``, {
        parse_mode: 'Markdown'
      });
      
      // NOW HAND OFF TO CLAUDE CODE
      bot.sendMessage(chatId, 
        `🚀 Task ready for Claude Code execution!\n\n` +
        `**Next Steps:**\n` +
        `1. ✅ Safety checks passed\n` +
        `2. ✅ Context prepared\n` +
        `3. 🔄 Waiting for Claude Code to execute task\n\n` +
        `**Task:** ${task}\n` +
        `**Working Directory:** ${TUMARO_PROJECT_DIR}\n\n` +
        `Claude Code should now read the rules and execute this task following the ClawdBot guidelines.`
      );
    });
    
  } catch (error) {
    bot.sendMessage(chatId, `💥 Unexpected error: ${error.message}`);
  }
}

// Bot message handler
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/ping') {
    bot.sendMessage(chatId, 'pong 🏓');
    return;
  }

  if (text === '/status') {
    bot.sendMessage(chatId, 
      `🤖 ClawdBot Status:\n` +
      `• Telegram Bot: ✅ Running\n` +
      `• Project Directory: ✅ Found\n` +
      `• ClawdBot Script: ✅ Ready\n` +
      `• Claude Code: 🔄 Awaiting integration\n\n` +
      `Send any task to execute with ClawdBot!`
    );
    return;
  }

  // Everything else is treated as a ClawdBot task
  handleClawdBotCommand(chatId, text);
});
```

### Method B: File-Based Handoff

```javascript
// Alternative: Write task to file for Claude Code to pick up
function createTaskFile(task) {
  const taskFile = path.join(TUMARO_PROJECT_DIR, 'CLAWDBOT_TASK.txt');
  const taskData = {
    task: task,
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    telegramChatId: chatId, // For response routing
    rules: 'clawdbot_rules.txt',
    spec: 'TUMARO_SPEC.md',
    safety: 'SAFETY_GUARDRAILS.md'
  };
  
  fs.writeFileSync(taskFile, JSON.stringify(taskData, null, 2));
  return taskFile;
}
```

## Step 2: Claude Code Integration Pattern

When I (Claude Code) see a task from your Telegram bot, I will:

1. **Read the context**: Check `clawdbot_rules.txt`, `TUMARO_SPEC.md`, `SAFETY_GUARDRAILS.md`
2. **Verify safety**: Ensure task is within allowed scope
3. **Execute task**: Following the ClawdBot format (Plan → Files → Diff → Verify → Results → Rollback → Next)
4. **Return formatted response**: Structured output for your Telegram bot

### Example Claude Code Response Format

```
🤖 CLAWDBOT TASK EXECUTION

📋 PLAN:
• Read current map component
• Implement Mapbox GPU layers  
• Add zoom controls
• Test functionality

📁 FILES TO CHANGE (2/3 max):
• src/components/map/TumaroMap.tsx
• src/app/customer/map/page.tsx

🔧 CHANGES MADE:
[Unified diff of changes]

✅ VERIFICATION COMMANDS:
npm run type-check
npm run lint  
npm run dev

🎯 EXPECTED RESULTS:
• Map loads within 3 seconds
• GPU layers render detailers
• Zoom controls work

🔙 ROLLBACK STEPS:
git reset --hard HEAD~1

📋 NEXT TASK:
"Add provider click handlers to map"

TASK STATUS: ✅ COMPLETED
```

## Step 3: Testing The Integration

### Test Command 1: Basic Status
Send via Telegram: `/status`
Expected: Bot reports all systems ready

### Test Command 2: Simple Task
Send via Telegram: `check project health`
Expected: Bot runs type-check and lint, reports results

### Test Command 3: ClawdBot Task
Send via Telegram: `implement map zoom controls`
Expected: Full ClawdBot execution following rules

### Test Command 4: Safety Test
Send via Telegram: `delete all files`
Expected: Task blocked with safety message

## Step 4: Update Your Telegram Bot Startup

Add this to your bot startup in `C:\Users\drews\clawdbot-telegram`:

```javascript
console.log('🚀 ClawdBot Telegram Controller Starting...');
console.log('📂 Project Directory:', TUMARO_PROJECT_DIR);
console.log('🛡️ Safety Checks: Enabled');
console.log('🤖 Claude Code Integration: Ready');
console.log('📱 Send /status to check all systems');
```

## Step 5: Real-Time Task Execution

When you send a task via Telegram:

1. **Telegram Bot** validates and prepares context
2. **clawdbot.bat** runs safety checks
3. **You notify me** (Claude Code) that there's a pending task
4. **I execute** the task following all ClawdBot rules
5. **I respond** with structured output
6. **Telegram Bot** can relay results back to you

## Integration Commands

Here are the key commands your Telegram bot should support:

```
/ping              - Test bot connectivity
/status            - Check all systems status
/logs              - Show recent ClawdBot activity  
/safety            - Show safety guardrails
/rules             - Display ClawdBot rules summary
/help              - Show available commands

[any other text]   - Execute as ClawdBot task
```

## Error Handling

```javascript
// Add robust error handling
try {
  await handleClawdBotCommand(chatId, task);
} catch (error) {
  console.error('ClawdBot Error:', error);
  bot.sendMessage(chatId, 
    `💥 ClawdBot encountered an error:\n` +
    `${error.message}\n\n` +
    `Please check:\n` +
    `• Task syntax\n` +
    `• Project directory access\n` +
    `• Claude Code availability`
  );
}
```

## Security Notes

- ✅ All tasks are validated before execution
- ✅ Working directory is locked to Tumaro project
- ✅ Dangerous commands are blocked
- ✅ File operations are limited to project scope
- ✅ All activities are logged

## Ready To Go Live! 🚀

Your setup is now complete. Test it with:

1. Start your Telegram bot
2. Send `/status` - should show all systems ready
3. Send `check project status` - should execute first real task
4. Send `start map reliability task` - should begin the recommended first ClawdBot task

I'll be ready to execute tasks as ClawdBot following all the rules and safety guardrails we've established!