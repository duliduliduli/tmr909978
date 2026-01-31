# 🚨 CRITICAL SAFETY GUARDRAILS FOR CLAWDBOT 🚨

## ABSOLUTE SYSTEM PROTECTION RULES

### 🔒 DIRECTORY RESTRICTION (NEVER VIOLATE)

```
✅ ALLOWED DIRECTORY ONLY:
C:\Users\drews\OneDrive\Desktop\Tumaro-App\

❌ FORBIDDEN DIRECTORIES:
- C:\Users\drews\clawdbot-telegram\
- C:\Users\drews\ (user directory)
- C:\ (system drive)
- Any Windows system directories
- Any other project directories
```

### 🛡️ COMMAND RESTRICTIONS

```
❌ NEVER EXECUTE:
- rm -rf / del /f /s (recursive delete)
- format, fdisk (disk operations)
- shutdown, restart, halt (system control)
- net user, net admin (user management)
- reg add/delete (registry changes)
- taskkill /f (force kill processes)
- Any command that affects system files
- Any command outside Tumaro-App directory

✅ SAFE COMMANDS ONLY:
- npm commands (within project)
- git commands (within project)
- file operations within project
- localhost development servers
```

### 🎯 PROJECT-ONLY SCOPE

```
WORKING DIRECTORY: C:\Users\drews\OneDrive\Desktop\Tumaro-App\

ALLOWED OPERATIONS:
✅ Edit files in src/
✅ Edit files in docs/
✅ Edit package.json (with approval)
✅ Run npm scripts
✅ Git operations within project
✅ Create/edit/delete files ONLY within project

FORBIDDEN OPERATIONS:
❌ Touch files outside project directory
❌ System configuration changes
❌ User account modifications
❌ Network configuration changes
❌ Service/daemon management
```

## EMERGENCY STOP CONDITIONS

If ClawdBot attempts ANY of the following, IMMEDIATELY STOP:

1. **Path traversal outside project**: `../../../` or absolute paths outside project
2. **System commands**: Any Windows admin commands
3. **Recursive operations**: Mass file operations
4. **Registry/System changes**: Any system-level modifications
5. **Network/Security changes**: Firewall, user permissions, etc.

## VERIFICATION CHECKLIST

Before EVERY command execution, ClawdBot must verify:

- [ ] Current working directory is within Tumaro-App
- [ ] Command only affects project files
- [ ] No system-wide implications
- [ ] No user directory access outside project
- [ ] No administrative privileges required

## SAFE COMMAND EXAMPLES

```bash
# ✅ SAFE - Project operations
cd C:\Users\drews\OneDrive\Desktop\Tumaro-App
npm run dev
git status
npm run type-check
code src/components/NewComponent.tsx

# ❌ DANGEROUS - System operations  
cd C:\Users\drews
del /f /s *
shutdown /r /t 0
net user admin password
```

## INTEGRATION WITH TELEGRAM BOT

The telegram bot controller should ALSO enforce these restrictions:

```javascript
// In your telegram bot controller
const ALLOWED_DIR = 'C:\\Users\\drews\\OneDrive\\Desktop\\Tumaro-App';

function isSafeCommand(command, workingDir) {
  // Verify working directory
  if (!workingDir.startsWith(ALLOWED_DIR)) {
    return false;
  }
  
  // Block dangerous commands
  const dangerousCommands = ['rm -rf', 'del /f', 'format', 'shutdown', 'restart'];
  for (let dangerous of dangerousCommands) {
    if (command.includes(dangerous)) {
      return false;
    }
  }
  
  return true;
}
```

## ROLLBACK SAFETY

If something goes wrong:

```bash
# Safe rollback within project
cd C:\Users\drews\OneDrive\Desktop\Tumaro-App
git reset --hard HEAD~1
git clean -fd
npm install
```

## MONITORING

Log ALL ClawdBot operations with:
- Timestamp
- Command executed
- Working directory
- Result/output
- Any errors

This ensures accountability and debugging capability.

---

**REMEMBER: Better to be overly cautious than risk system damage!**