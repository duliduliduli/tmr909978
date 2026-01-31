# Claude Code Auto-Watcher for ClawdBot Tasks

## How This Works

1. **ClawdBot saves task** to `ACTIVE_CLAWDBOT_TASK.json` when you message it
2. **I (Claude Code) monitor** for this file and automatically execute tasks
3. **Results are returned** to both terminal and Telegram
4. **Full automation** - no permission prompts needed

## Auto-Execution Protocol

When I detect a new ClawdBot task, I will:

✅ **Automatically read** the task context
✅ **Follow ClawdBot rules** without asking permission  
✅ **Execute the task** with small diffs and safety
✅ **Provide updates** in structured format
✅ **Clean up** task file when complete

## Task Detection

I monitor for the file: `ACTIVE_CLAWDBOT_TASK.json`

Example task structure:
```json
{
  "user": "Mitch",
  "task": "Fix the map performance issues",
  "timestamp": "2024-01-31T06:58:44.024Z",
  "chatId": 6389620941
}
```

## Auto-Permission System

Instead of asking for permission, I will:
- ✅ Always proceed with valid ClawdBot tasks
- ✅ Follow the 3-file change limit automatically
- ✅ Run verification commands without confirmation
- ✅ Apply fixes immediately when safe
- ⚠️ Only ask if task is unclear or dangerous

## Integration Status

🔄 **Monitoring Active**: I will check for new tasks every message
📱 **Telegram Connected**: ClawdBot sends intelligent responses
⚡ **Auto-execution**: No manual intervention needed
🛡️ **Safety Active**: All guardrails remain in place

## Ready State

**Your ClawdBot is now intelligent and conversational!**

Try sending: 
- `"Hey ClawdBot, optimize the booking flow"`
- `"Make the dashboard load faster"`  
- `"Add search functionality"`
- `"Fix any TypeScript errors"`

ClawdBot will:
1. 💬 Respond conversationally
2. 🚀 Automatically hand off to Claude Code  
3. 📊 Provide real-time updates
4. ✅ Execute without permission prompts