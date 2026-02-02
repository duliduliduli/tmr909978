@echo off
REM ClawdBot Wrapper Script for Tumaro
REM This script ensures safe operation within project directory only

REM Safety check - ensure we're in the right directory
cd /d "C:\Users\drews\OneDrive\Desktop\Tumaro-App"
if not "%CD%"=="C:\Users\drews\OneDrive\Desktop\Tumaro-App" (
    echo ERROR: Not in safe project directory!
    echo Current: %CD%
    echo Expected: C:\Users\drews\OneDrive\Desktop\Tumaro-App
    exit /b 1
)

REM Verify project files exist
if not exist "TUMARO_SPEC.md" (
    echo ERROR: TUMARO_SPEC.md not found - not in Tumaro project directory!
    exit /b 1
)

if not exist "clawdbot_rules.txt" (
    echo ERROR: clawdbot_rules.txt not found - safety rules missing!
    exit /b 1
)

REM Display safety reminder
echo =================================
echo 🚨 CLAWDBOT SAFETY MODE ACTIVE 🚨
echo Working Directory: %CD%
echo Task: %*
echo =================================
echo.

REM CLAUDE CODE INTEGRATION - ClawdBot Intelligence
echo ⚡ Connecting to Claude Code for task execution...
echo.

REM Create task context file for Claude Code
echo Creating task context...
echo TASK: %* > temp_clawdbot_task.txt
echo PROJECT_DIR: %CD% >> temp_clawdbot_task.txt
echo RULES_FILE: clawdbot_rules.txt >> temp_clawdbot_task.txt
echo SPEC_FILE: TUMARO_SPEC.md >> temp_clawdbot_task.txt
echo SAFETY_FILE: SAFETY_GUARDRAILS.md >> temp_clawdbot_task.txt
echo TIMESTAMP: %date% %time% >> temp_clawdbot_task.txt

REM Display task info
echo 📋 Task Details:
echo    Task: %*
echo    Working Directory: %CD%
echo    Rules: clawdbot_rules.txt ✅
echo    Spec: TUMARO_SPEC.md ✅
echo    Safety: SAFETY_GUARDRAILS.md ✅
echo.

REM INTEGRATION POINT: This is where your Telegram bot should
REM hand off to Claude Code with the prepared context
echo 🚀 READY FOR CLAUDE CODE INTEGRATION
echo.
echo Integration Instructions:
echo 1. Your Telegram bot detected command: %*
echo 2. Bot called this script with safety checks ✅
echo 3. Context prepared in: temp_clawdbot_task.txt
echo 4. Ready to pass to Claude Code session
echo.
echo Claude Code should now:
echo - Read the task from temp_clawdbot_task.txt
echo - Follow rules in clawdbot_rules.txt  
echo - Use TUMARO_SPEC.md as source of truth
echo - Execute task with safety guardrails
echo - Return result to Telegram bot

REM Clean up
if exist temp_clawdbot_task.txt del temp_clawdbot_task.txt

exit /b 0