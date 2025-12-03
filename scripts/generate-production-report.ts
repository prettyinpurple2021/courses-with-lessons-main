#!/usr/bin/env tsx
/**
 * Production Readiness Report Generator
 * 
 * Generates a comprehensive production readiness report by running all verification scripts
 * and compiling the results into a single report.
 * 
 * Usage: tsx scripts/generate-production-report.ts
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface ReportSection {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  output: string;
  errors?: string[];
  warnings?: string[];
}

const report: ReportSection[] = [];
const timestamp = new Date().toISOString();

function runScript(scriptName: string, description: string): ReportSection {
  console.log(`\n🔍 Running: ${description}...`);
  
  try {
    const output = execSync(`tsx scripts/${scriptName}`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Parse output to determine status
    let status: 'pass' | 'fail' | 'warning' = 'pass';
    const errors: string[] = [];
    const warnings: string[] = [];

    if (output.includes('❌') || output.includes('Failed') || output.includes('error')) {
      status = 'fail';
    } else if (output.includes('⚠️') || output.includes('Warning') || output.includes('warning')) {
      status = 'warning';
    }

    // Extract errors and warnings
    const lines = output.split('\n');
    let inErrorSection = false;
    let inWarningSection = false;

    for (const line of lines) {
      if (line.includes('ERRORS') || line.includes('❌')) {
        inErrorSection = true;
        inWarningSection = false;
        continue;
      }
      if (line.includes('WARNINGS') || line.includes('⚠️')) {
        inWarningSection = true;
        inErrorSection = false;
        continue;
      }
      if (inErrorSection && line.trim().startsWith('-')) {
        errors.push(line.trim());
      }
      if (inWarningSection && line.trim().startsWith('-')) {
        warnings.push(line.trim());
      }
    }

    return {
      name: description,
      status,
      output,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error: any) {
    return {
      name: description,
      status: 'fail',
      output: error.stdout || error.message,
      errors: [error.message],
    };
  }
}

function generateMarkdownReport(): string {
  const totalChecks = report.length;
  const passed = report.filter(r => r.status === 'pass').length;
  const failed = report.filter(r => r.status === 'fail').length;
  const warnings = report.filter(r => r.status === 'warning').length;

  let md = `# Production Readiness Report\n\n`;
  md += `**Generated:** ${timestamp}\n\n`;
  md += `## Summary\n\n`;
  md += `- ✅ Passed: ${passed}/${totalChecks}\n`;
  md += `- ❌ Failed: ${failed}/${totalChecks}\n`;
  md += `- ⚠️  Warnings: ${warnings}/${totalChecks}\n\n`;

  if (failed === 0 && warnings === 0) {
    md += `## 🎉 Status: READY FOR PRODUCTION\n\n`;
    md += `All checks passed! Your application is ready for production deployment.\n\n`;
  } else if (failed === 0) {
    md += `## ⚠️  Status: READY WITH WARNINGS\n\n`;
    md += `No critical errors found. Review warnings before deploying.\n\n`;
  } else {
    md += `## ❌ Status: NOT READY FOR PRODUCTION\n\n`;
    md += `Critical errors found. Please fix all errors before deploying.\n\n`;
  }

  md += `---\n\n`;

  // Detailed sections
  for (const section of report) {
    const statusIcon = section.status === 'pass' ? '✅' : section.status === 'fail' ? '❌' : '⚠️';
    md += `## ${statusIcon} ${section.name}\n\n`;

    if (section.errors && section.errors.length > 0) {
      md += `### Errors\n\n`;
      section.errors.forEach(error => {
        md += `- ${error}\n`;
      });
      md += `\n`;
    }

    if (section.warnings && section.warnings.length > 0) {
      md += `### Warnings\n\n`;
      section.warnings.forEach(warning => {
        md += `- ${warning}\n`;
      });
      md += `\n`;
    }

    md += `<details>\n<summary>Full Output</summary>\n\n\`\`\`\n${section.output}\n\`\`\`\n\n</details>\n\n`;
    md += `---\n\n`;
  }

  // Action items
  md += `## Action Items\n\n`;
  
  const actionItems: string[] = [];
  
  report.forEach(section => {
    if (section.status === 'fail') {
      actionItems.push(`- [ ] Fix errors in: ${section.name}`);
    }
    if (section.warnings && section.warnings.length > 0) {
      actionItems.push(`- [ ] Review warnings in: ${section.name}`);
    }
  });

  if (actionItems.length === 0) {
    md += `- [x] All checks passed - ready to deploy!\n\n`;
  } else {
    actionItems.forEach(item => {
      md += `${item}\n`;
    });
    md += `\n`;
  }

  // Next steps
  md += `## Next Steps\n\n`;
  
  if (failed > 0) {
    md += `1. Fix all critical errors listed above\n`;
    md += `2. Re-run this report: \`npm run report:production\`\n`;
    md += `3. Complete testing checklist\n`;
    md += `4. Configure production environment\n`;
    md += `5. Deploy to production\n`;
  } else if (warnings > 0) {
    md += `1. Review and address warnings\n`;
    md += `2. Complete testing checklist\n`;
    md += `3. Configure production environment\n`;
    md += `4. Deploy to production\n`;
  } else {
    md += `1. Complete final testing checklist\n`;
    md += `2. Configure production environment variables\n`;
    md += `3. Set up monitoring and error tracking\n`;
    md += `4. Deploy to production\n`;
  }

  md += `\n---\n\n`;
  md += `*Report generated by SoloSuccess Intel Academy Production Readiness Tools*\n`;

  return md;
}

async function main() {
  console.log('📊 Generating Production Readiness Report\n');
  console.log('='.repeat(70));

  // Run all verification scripts
  report.push(runScript('production-readiness-check.ts', 'Production Readiness Check'));
  report.push(runScript('verify-content-completeness.ts', 'Content Completeness Verification'));
  
  // Try to run YouTube verification (may fail if API key not set)
  try {
    report.push(runScript('verify-youtube-videos.ts', 'YouTube Video Verification'));
  } catch (error) {
    report.push({
      name: 'YouTube Video Verification',
      status: 'warning',
      output: 'Skipped - YouTube API key may not be configured',
      warnings: ['YouTube verification skipped'],
    });
  }

  // Generate report
  const markdown = generateMarkdownReport();
  
  // Save to file
  const reportPath = join(process.cwd(), 'PRODUCTION_READINESS_REPORT.md');
  writeFileSync(reportPath, markdown);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📄 Report saved to: PRODUCTION_READINESS_REPORT.md\n');
  
  // Print summary
  const totalChecks = report.length;
  const passed = report.filter(r => r.status === 'pass').length;
  const failed = report.filter(r => r.status === 'fail').length;
  const warnings = report.filter(r => r.status === 'warning').length;

  console.log('Summary:');
  console.log(`  ✅ Passed: ${passed}/${totalChecks}`);
  console.log(`  ❌ Failed: ${failed}/${totalChecks}`);
  console.log(`  ⚠️  Warnings: ${warnings}/${totalChecks}\n`);

  if (failed === 0 && warnings === 0) {
    console.log('🎉 All checks passed! Ready for production.\n');
    process.exit(0);
  } else if (failed === 0) {
    console.log('✅ No critical errors. Review warnings before production.\n');
    process.exit(0);
  } else {
    console.log('❌ Critical errors found. Please fix before production.\n');
    process.exit(1);
  }
}

main();

