// Claude Code Auto-Task Detection
// This script monitors for ClawdBot tasks and can be run to check for new work

const fs = require('fs');
const path = require('path');

const TASK_FILE = path.join(__dirname, 'ACTIVE_CLAWDBOT_TASK.json');

function checkForNewTask() {
  try {
    if (fs.existsSync(TASK_FILE)) {
      const taskData = fs.readFileSync(TASK_FILE, 'utf8');
      const task = JSON.parse(taskData);
      
      console.log('🤖 NEW CLAWDBOT TASK DETECTED:');
      console.log('=====================================');
      console.log(`👤 User: ${task.user}`);
      console.log(`📝 Task: ${task.task}`);
      console.log(`⏰ Time: ${task.timestamp}`);
      console.log(`💬 Chat: ${task.chatId}`);
      console.log('=====================================');
      console.log('');
      console.log('🚀 READY FOR CLAUDE CODE EXECUTION');
      console.log('');
      console.log('Claude Code should now:');
      console.log('• Read the task context above');
      console.log('• Follow ClawdBot rules in clawdbot_rules.txt');
      console.log('• Execute with auto-approval (no permission prompts)');
      console.log('• Provide structured response');
      console.log('• Delete this task file when complete');
      console.log('');
      
      return task;
    }
    return null;
  } catch (error) {
    console.error('Error checking for task:', error.message);
    return null;
  }
}

function markTaskComplete() {
  try {
    if (fs.existsSync(TASK_FILE)) {
      fs.unlinkSync(TASK_FILE);
      console.log('✅ Task file cleaned up');
    }
  } catch (error) {
    console.error('Error cleaning up task file:', error.message);
  }
}

// Export functions for use
module.exports = { checkForNewTask, markTaskComplete };

// If run directly, check for tasks
if (require.main === module) {
  const task = checkForNewTask();
  if (!task) {
    console.log('📭 No active ClawdBot tasks found');
  }
}