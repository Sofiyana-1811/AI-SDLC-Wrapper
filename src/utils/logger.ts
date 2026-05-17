import chalk from 'chalk';

/**
 * Simple logger utility with colored output
 */
export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }
  
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }
  
  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }
  
  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }
  
  static header(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('═'.repeat(message.length)));
  }
  
  static section(message: string): void {
    console.log();
    console.log(chalk.bold(message));
  }
  
  static prompt(message: string): void {
    console.log(chalk.yellow('❯'), message);
  }
  
  static code(code: string): void {
    console.log();
    console.log(chalk.gray(code));
    console.log();
  }
  
  static box(content: string): void {
    const lines = content.split('\n');
    const maxLength = Math.max(...lines.map(l => l.length));
    const border = '═'.repeat(maxLength + 4);
    
    console.log();
    console.log(chalk.yellow(border));
    lines.forEach(line => {
      console.log(chalk.yellow('║ ') + line.padEnd(maxLength) + chalk.yellow(' ║'));
    });
    console.log(chalk.yellow(border));
    console.log();
  }
  
  static newline(): void {
    console.log();
  }
}

// Made with Bob
