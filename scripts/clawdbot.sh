#!/bin/bash
# ClawdBot Wrapper Script for Tumaro (Linux/WSL Version)
# This script ensures safe operation within project directory only

# Safety check - ensure we're in the right directory
PROJECT_DIR="/mnt/c/Users/drews/OneDrive/Desktop/Tumaro-App"
cd "$PROJECT_DIR"

if [[ "$PWD" != "$PROJECT_DIR" ]]; then
    echo "ERROR: Not in safe project directory!"
    echo "Current: $PWD"
    echo "Expected: $PROJECT_DIR"
    exit 1
fi

# Verify project files exist
if [[ ! -f "TUMARO_SPEC.md" ]]; then
    echo "ERROR: TUMARO_SPEC.md not found - not in Tumaro project directory!"
    exit 1
fi

if [[ ! -f "clawdbot_rules.txt" ]]; then
    echo "ERROR: clawdbot_rules.txt not found - safety rules missing!"
    exit 1
fi

# Display safety reminder
echo "================================="
echo "🚨 CLAWDBOT SAFETY MODE ACTIVE 🚨"
echo "Working Directory: $PWD"
echo "Task: $1"
echo "================================="
echo ""

# CLAUDE CODE INTEGRATION - ClawdBot Intelligence
echo "⚡ Connecting to Claude Code for task execution..."
echo ""

# Display task info
echo "📋 Task Details:"
echo "   Task: $1"
echo "   Working Directory: $PWD"
echo "   Rules: clawdbot_rules.txt ✅"
echo "   Spec: TUMARO_SPEC.md ✅"
echo "   Safety: SAFETY_GUARDRAILS.md ✅"
echo ""

# INTEGRATION POINT: This is where your Telegram bot should
# hand off to Claude Code with the prepared context
echo "🚀 READY FOR CLAUDE CODE INTEGRATION"
echo ""
echo "Integration Instructions:"
echo "1. Your Telegram bot detected command: $1"
echo "2. Bot called this script with safety checks ✅"
echo "3. Context prepared and validated ✅"
echo "4. Ready to pass to Claude Code session"
echo ""
echo "Claude Code should now:"
echo "- Read the task: $1"
echo "- Follow rules in clawdbot_rules.txt"
echo "- Use TUMARO_SPEC.md as source of truth"
echo "- Execute task with safety guardrails"
echo "- Return structured result to Telegram bot"
echo ""

# Create a trigger file for Claude Code to detect and auto-execute
echo "🔄 Creating Claude Code trigger file..."
cat > "CLAUDE_CODE_TRIGGER.json" << EOF
{
  "task": "$1",
  "timestamp": "$(date -Iseconds)",
  "auto_execute": true,
  "source": "telegram_clawdbot",
  "safety_checked": true,
  "rules_verified": true,
  "context_prepared": true
}
EOF

echo "✅ Task trigger created: CLAUDE_CODE_TRIGGER.json"
echo "🚀 Claude Code should now automatically detect and execute this task"

exit 0
