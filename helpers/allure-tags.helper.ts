import * as allure from 'allure-js-commons';

type AllureSeverity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
type CaseSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
type CasePriority = 'Critical' | 'High' | 'Medium' | 'Low';

const SEVERITY_MAP: Record<CaseSeverity, AllureSeverity> = {
  Critical: 'critical',
  High: 'normal',
  Medium: 'minor',
  Low: 'trivial',
};

export async function setAllureTags(severity: CaseSeverity, priority: CasePriority): Promise<void> {
  await allure.severity(SEVERITY_MAP[severity]);
  await allure.label('priority', priority);
}
