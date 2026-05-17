import fs from 'fs/promises';
import path from 'path';

export interface TemplateVariables {
  [key: string]: string | boolean | number | undefined;
}

/**
 * TemplateEngine handles loading and rendering markdown templates with variable substitution.
 * Supports simple variables {{VAR_NAME}} and conditionals {{#if VAR}}...{{/if}}
 */
export class TemplateEngine {
  private templatesDir: string;
  
  constructor(templatesDir?: string) {
    // Default to templates directory relative to this file
    this.templatesDir = templatesDir || path.join(__dirname, 'templates');
  }
  
  /**
   * Load and render a template with variables
   */
  async render(
    templateName: string,
    variables: TemplateVariables
  ): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.md`);
    
    try {
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Replace simple variables: {{VAR_NAME}}
      template = this.replaceVariables(template, variables);
      
      // Handle conditionals: {{#if VAR}}...{{/if}}
      template = this.handleConditionals(template, variables);
      
      // Clean up extra blank lines
      template = this.cleanupWhitespace(template);
      
      return template.trim();
    } catch (error) {
      throw new Error(`Failed to render template '${templateName}': ${error}`);
    }
  }
  
  /**
   * Replace {{VAR_NAME}} with values
   */
  private replaceVariables(
    template: string,
    variables: TemplateVariables
  ): string {
    return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, varName) => {
      const value = variables[varName];
      return value !== undefined ? String(value) : match;
    });
  }
  
  /**
   * Handle {{#if VAR}}...{{/if}} conditionals
   */
  private handleConditionals(
    template: string,
    variables: TemplateVariables
  ): string {
    return template.replace(
      /\{\{#if ([A-Z_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (_match, varName, content) => {
        const value = variables[varName];
        // Treat empty strings, false, null, undefined as falsy
        const isTruthy = value && value !== '' && value !== 'false';
        return isTruthy ? content : '';
      }
    );
  }
  
  /**
   * Clean up excessive whitespace while preserving intentional formatting
   */
  private cleanupWhitespace(text: string): string {
    // Remove more than 2 consecutive blank lines
    return text.replace(/\n{3,}/g, '\n\n');
  }
  
  /**
   * Estimate token count for rendered template
   * Rough estimate: 1 token ≈ 4 characters
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Check if a template exists
   */
  async templateExists(templateName: string): Promise<boolean> {
    const templatePath = path.join(this.templatesDir, `${templateName}.md`);
    try {
      await fs.access(templatePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * List all available templates
   */
  async listTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templatesDir);
      return files
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
    } catch {
      return [];
    }
  }
}

// Made with Bob
