import { TemplateEngine } from '../../src/prompts/template-engine';
import fs from 'fs/promises';
import path from 'path';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;
  let testTemplatesDir: string;

  beforeEach(async () => {
    // Create a temporary test templates directory
    testTemplatesDir = path.join(__dirname, 'test-templates');
    await fs.mkdir(testTemplatesDir, { recursive: true });
    engine = new TemplateEngine(testTemplatesDir);
  });

  afterEach(async () => {
    // Clean up test templates
    try {
      await fs.rm(testTemplatesDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('render', () => {
    it('should replace simple variables', async () => {
      const template = 'Hello {{NAME}}, you are {{AGE}} years old.';
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        NAME: 'Alice',
        AGE: 30,
      });

      expect(result).toBe('Hello Alice, you are 30 years old.');
    });

    it('should handle conditionals with truthy values', async () => {
      const template = '{{#if SHOW_MESSAGE}}This is visible{{/if}}';
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        SHOW_MESSAGE: true,
      });

      expect(result).toBe('This is visible');
    });

    it('should handle conditionals with falsy values', async () => {
      const template = '{{#if SHOW_MESSAGE}}This is hidden{{/if}}';
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        SHOW_MESSAGE: false,
      });

      expect(result).toBe('');
    });

    it('should handle nested content in conditionals', async () => {
      const template = `{{#if HAS_DETAILS}}
## Details
Name: {{NAME}}
Age: {{AGE}}
{{/if}}`;
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        HAS_DETAILS: true,
        NAME: 'Bob',
        AGE: 25,
      });

      expect(result).toContain('## Details');
      expect(result).toContain('Name: Bob');
      expect(result).toContain('Age: 25');
    });

    it('should leave undefined variables unchanged', async () => {
      const template = 'Hello {{NAME}}, {{UNDEFINED_VAR}}';
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        NAME: 'Alice',
      });

      expect(result).toBe('Hello Alice, {{UNDEFINED_VAR}}');
    });

    it('should clean up excessive whitespace', async () => {
      const template = 'Line 1\n\n\n\n\nLine 2';
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {});

      expect(result).toBe('Line 1\n\nLine 2');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        engine.render('non-existent', {})
      ).rejects.toThrow();
    });

    it('should handle complex template with multiple features', async () => {
      const template = `# {{TITLE}}

{{#if DESCRIPTION}}
## Description
{{DESCRIPTION}}
{{/if}}

## Details
- Name: {{NAME}}
- Age: {{AGE}}

{{#if SHOW_FOOTER}}
---
Footer content
{{/if}}`;
      await fs.writeFile(
        path.join(testTemplatesDir, 'test.md'),
        template
      );

      const result = await engine.render('test', {
        TITLE: 'Test Document',
        DESCRIPTION: 'This is a test',
        NAME: 'Alice',
        AGE: 30,
        SHOW_FOOTER: true,
      });

      expect(result).toContain('# Test Document');
      expect(result).toContain('## Description');
      expect(result).toContain('This is a test');
      expect(result).toContain('Name: Alice');
      expect(result).toContain('Age: 30');
      expect(result).toContain('Footer content');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate tokens correctly', () => {
      const text = 'This is a test string with some content';
      const tokens = engine.estimateTokens(text);
      
      // Rough estimate: 1 token ≈ 4 characters
      const expectedTokens = Math.ceil(text.length / 4);
      expect(tokens).toBe(expectedTokens);
    });

    it('should handle empty string', () => {
      expect(engine.estimateTokens('')).toBe(0);
    });
  });

  describe('templateExists', () => {
    it('should return true for existing template', async () => {
      await fs.writeFile(
        path.join(testTemplatesDir, 'exists.md'),
        'content'
      );

      const exists = await engine.templateExists('exists');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent template', async () => {
      const exists = await engine.templateExists('does-not-exist');
      expect(exists).toBe(false);
    });
  });

  describe('listTemplates', () => {
    it('should list all markdown templates', async () => {
      await fs.writeFile(
        path.join(testTemplatesDir, 'template1.md'),
        'content'
      );
      await fs.writeFile(
        path.join(testTemplatesDir, 'template2.md'),
        'content'
      );
      await fs.writeFile(
        path.join(testTemplatesDir, 'not-template.txt'),
        'content'
      );

      const templates = await engine.listTemplates();
      
      expect(templates).toHaveLength(2);
      expect(templates).toContain('template1');
      expect(templates).toContain('template2');
      expect(templates).not.toContain('not-template');
    });

    it('should return empty array for non-existent directory', async () => {
      const nonExistentEngine = new TemplateEngine('/non/existent/path');
      const templates = await nonExistentEngine.listTemplates();
      
      expect(templates).toEqual([]);
    });
  });
});

// Made with Bob
