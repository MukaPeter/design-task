'use client'

import { useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Handle,
  Position,
} from '@xyflow/react'
import type { Node, Edge, Connection, NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ─── Node types ───────────────────────────────────────────────────────────────

interface CIANodeData extends Record<string, unknown> {
  label?: string
  sublabel?: string
  status?: string
  confidence?: number
  nodeType?: string
}

function confidenceColor(score: number) {
  if (score >= 85) return 'text-muted-foreground'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

const STATUS_DOT: Record<string, string> = {
  'up-to-date':   'bg-green-500',
  'needs-review': 'bg-amber-400',
  'stale':        'bg-red-500',
}

function StatusDot({ status }: { status: string }) {
  return <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status] ?? 'bg-muted-foreground'}`} />
}

function PrimaryNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as CIANodeData
  return (
    <div className={`rounded-md border px-3 py-2 text-xs shadow-sm min-w-[130px] transition-colors ${selected ? 'border-primary border-[3px] bg-background' : 'border-foreground bg-background hover:border-primary hover:bg-primary/10'}`}>
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-foreground leading-tight text-sm">{String(data.label ?? '')}</div>
        {data.status && <StatusDot status={String(data.status)} />}
      </div>
      {data.sublabel && (
        <div className="text-muted-foreground mt-0.5 leading-tight">{String(data.sublabel)}</div>
      )}
      <div className="mt-2">
        <span className="text-xs font-medium text-foreground">Impacted</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

function SecondaryNode({ data: rawData }: NodeProps) {
  const data = rawData as CIANodeData
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs min-w-[130px] hover:border-primary hover:bg-primary/10 transition-colors">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-muted-foreground leading-tight text-sm">{String(data.label ?? '')}</div>
      </div>
      {data.sublabel && (
        <div className="text-muted-foreground/70 mt-0.5 leading-tight">{String(data.sublabel)}</div>
      )}
      <div className="mt-2">
        <span className="text-xs font-medium text-red-500">Possible impact</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const NODE_TYPES = { primary: PrimaryNode, secondary: SecondaryNode }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlowProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  edgeType?: 'step' | 'smoothstep' | 'straight' | 'default'
  showControls?: boolean
  showBackground?: boolean
  onNodeClick?: (node: Node) => void
  selectedNodeId?: string | null
  nodeOverrides?: Record<string, Record<string, unknown>>
}

// ─── CIA scenario data ────────────────────────────────────────────────────────

export const DEFAULT_NODES: Node[] = [
  // Root — changed requirement
  {
    id: 'req-142', type: 'primary', position: { x: 0, y: 260 },
    data: { label: 'REQ-142', sublabel: 'Rate Limit Enforcement', nodeType: 'Requirement', status: 'stale', confidence: 97,
      Description: 'Algorithm enforcing maximum infusion rate (mL/hr) per drug profile',
      Version: 'v2.1 → v2.2 (pending)', Owner: 'J. Müller', Regulation: 'IEC 62304 §5.3',
      'Jira ticket': 'KTX-2047', 'GitHub PR': '#847' },
  },

  // Direct impacts
  {
    id: 'haz-047', type: 'primary', position: { x: 260, y: 20 },
    data: { label: 'HAZ-047', sublabel: 'Overdose Delivery', nodeType: 'Hazard', status: 'needs-review', confidence: 88,
      Harm: 'Patient receives infusion dose exceeding therapeutic limit',
      Severity: 'Critical (S3)', Probability: 'Remote (P2)', Population: 'All pump users' },
  },
  {
    id: 'risk-047a', type: 'primary', position: { x: 260, y: 200 },
    data: { label: 'RISK-047-A', sublabel: 'Rate Limit Control', nodeType: 'Risk Control', status: 'stale', confidence: 54,
      Mitigates: 'HAZ-047',
      Mechanism: 'Software enforces rate ceiling before motor command',
      'Residual Risk': 'Acceptable', 'Verification Status': 'Re-verification required' },
  },
  {
    id: 'risk-047b', type: 'primary', position: { x: 260, y: 340 },
    data: { label: 'RISK-047-B', sublabel: 'Alarm on Violation', nodeType: 'Risk Control', status: 'up-to-date', confidence: 85,
      Mitigates: 'HAZ-047',
      Mechanism: 'Audible alarm + pump halt if rate limit breached',
      'Residual Risk': 'Acceptable', 'Verification Status': 'Verified' },
  },
  {
    id: 'spec-sw230', type: 'primary', position: { x: 260, y: 470 },
    data: { label: 'SPEC-SW-230', sublabel: 'Rate Limiter Design', nodeType: 'Design Spec', status: 'stale', confidence: 90,
      Component: 'Rate Limiter Module', Revision: 'r4 (draft)', Author: 'T. Nakamura' },
  },

  // Verification tests
  {
    id: 'test-v340', type: 'primary', position: { x: 520, y: 200 },
    data: { label: 'TEST-V-340', sublabel: 'Rate Limit Boundary', nodeType: 'Verification Test', status: 'stale', confidence: 95,
      Method: 'Boundary value analysis at ±5% of rate limit',
      'Last Run': '2024-11-03', Result: 'Pass (v2.1 — outdated)', Tester: 'QA Lab' },
  },
  {
    id: 'test-v341', type: 'primary', position: { x: 520, y: 340 },
    data: { label: 'TEST-V-341', sublabel: 'Overdose Prevention', nodeType: 'Verification Test', status: 'up-to-date', confidence: 87,
      Method: 'System test: alarm trigger + pump stop on limit breach',
      'Last Run': '2024-11-03', Result: 'Pass', Tester: 'QA Lab' },
  },

  // Governance
  {
    id: 'sop-015', type: 'primary', position: { x: 760, y: 270 },
    data: { label: 'SOP-QMS-015', sublabel: 'Software Change Control', nodeType: 'SOP', status: 'needs-review', confidence: 82,
      Version: 'v3.2', 'Last Reviewed': '2024-09-15', Owner: 'QA Manager', 'Approval Status': 'Active' },
  },
  {
    id: 'iec-62304', type: 'primary', position: { x: 1020, y: 100 },
    data: { label: 'IEC 62304', sublabel: '§5.3 Detailed Design', nodeType: 'Regulatory Clause', status: 'up-to-date', confidence: 96,
      Clause: '§5.3 Software Detailed Design',
      Requirement: 'Detailed design shall address all safety requirements',
      Compliance: 'Compliant', Evidence: 'SPEC-SW-230, TEST-V-340' },
  },
  {
    id: 'iso-14971', type: 'primary', position: { x: 1020, y: 340 },
    data: { label: 'ISO 14971', sublabel: '§6.3 Control Verification', nodeType: 'Regulatory Clause', status: 'needs-review', confidence: 79,
      Clause: '§6.3 Risk Control Verification',
      Requirement: 'Verify effectiveness of risk controls after changes',
      Compliance: 'Under review', Evidence: 'RISK-047-A, TEST-V-340' },
  },

  // Secondary — agent-suggested "check these"
  {
    id: 'spec-hw105', type: 'secondary', position: { x: 620, y: 470 },
    data: { label: 'SPEC-HW-105', sublabel: 'Motor Controller Interface', nodeType: 'Design Spec', status: 'up-to-date', confidence: 54,
      Component: 'Pump Motor Controller Interface', Revision: 'r2.0', Author: 'H. Fischer' },
  },
  {
    id: 'test-v210', type: 'secondary', position: { x: 620, y: 570 },
    data: { label: 'TEST-V-210', sublabel: 'Drug Library Update Test', nodeType: 'Verification Test', status: 'up-to-date', confidence: 61,
      Method: 'Regression: drug library update does not bypass rate limits',
      'Last Run': '2024-10-20', Result: 'Pass', Tester: 'QA Lab' },
  },
  {
    id: 'ui-spec088', type: 'secondary', position: { x: 260, y: 570 },
    data: { label: 'UI-SPEC-088', sublabel: 'Rate Entry Screen', nodeType: 'Design Spec', status: 'needs-review', confidence: 58,
      Component: 'Rate Entry Screen', Revision: 'r1.3', Author: 'UX Team' },
  },
  {
    id: 'dhf-024', type: 'secondary', position: { x: 1380, y: 460 },
    data: { label: 'DOC-DHF-024', sublabel: 'Design History File', nodeType: 'Documentation', status: 'needs-review', confidence: 67,
      Version: 'v5.1', 'Last Updated': '2024-11-01', Owner: 'Regulatory Affairs' },
  },
]

// ─── Agent reasoning per node ─────────────────────────────────────────────────

export interface ReasoningTool {
  call: string
  resultText: string
  links?: string[]
}

export interface NodeReasoning {
  tools: ReasoningTool[]
  reasoning: string
  confidenceExplanation: string
  ruledOut: { item: string; reason: string }[]
}

export const NODE_REASONING: Record<string, NodeReasoning> = {
  'req-085': {
    tools: [
      { call: 'search_traceability_db("REQ-085")', resultText: '2 downstream links found', links: ['REQ-142', 'TEST-V-210'] },
      { call: 'check_requirement_dependencies("REQ-142")', resultText: 'REQ-085 listed as upstream input', links: ['REQ-085'] },
    ],
    reasoning: 'REQ-085 defines the drug safety limits that REQ-142 enforces. A change to the enforcement algorithm may require re-validating whether the upstream limits are still correctly consumed.',
    confidenceExplanation: 'Deducted 22% — the link is upstream and indirect. REQ-085 itself did not change, but its downstream consumer did.',
    ruledOut: [
      { item: 'SPEC-HW-105', reason: 'No traceability link between drug library limits and motor controller interface.' },
    ],
  },
  'req-201': {
    tools: [
      { call: 'search_traceability_db("REQ-201")', resultText: '1 shared dependency found', links: ['REQ-142'] },
      { call: 'query_change_log("input validation")', resultText: 'No changes in last 6 months' },
    ],
    reasoning: 'REQ-201 validates user dose entry before it reaches the rate limiter. The enforcement change in REQ-142 does not alter the input boundary, so this requirement is likely unaffected.',
    confidenceExplanation: 'High confidence — explicit link exists but change direction is downstream of REQ-201, not through it.',
    ruledOut: [
      { item: 'UI-SPEC-088', reason: 'Input validation logic is backend — no evidence of UI coupling to rate limit enforcement.' },
    ],
  },
  'req-142': {
    tools: [
      { call: 'get_changed_artifact("REQ-142")', resultText: 'Version bump v2.1 → v2.2, enforcement algorithm modified', links: ['REQ-142'] },
      { call: 'search_traceability_db("REQ-142")', resultText: '6 linked items found', links: ['HAZ-047', 'RISK-047-A', 'RISK-047-B', 'SPEC-SW-230', 'TEST-V-340', 'TEST-V-341'] },
      { call: 'query_risk_register("rate limit enforcement")', resultText: '2 risk controls matched', links: ['RISK-047-A', 'RISK-047-B'] },
    ],
    reasoning: 'This is the root change. The enforcement algorithm modification directly impacts all linked risk controls, the design spec implementing it, and any verification tests that validate its behaviour.',
    confidenceExplanation: 'Near-certain — this is the origin artifact of the change. All downstream links were confirmed via traceability matrix.',
    ruledOut: [
      { item: 'REQ-115 (Dose Confirmation UI)', reason: 'No traceability link to enforcement algorithm. UI confirmation happens before rate limiting.' },
      { item: 'TEST-V-115 (UI Flow Test)', reason: 'Tests user interaction, not backend enforcement logic.' },
    ],
  },
  'haz-047': {
    tools: [
      { call: 'query_risk_register("REQ-142")', resultText: 'Linked via mitigation chain', links: ['HAZ-047'] },
      { call: 'check_hazard_controls("HAZ-047")', resultText: '2 controls found', links: ['RISK-047-A', 'RISK-047-B'] },
    ],
    reasoning: 'HAZ-047 is the overdose hazard that REQ-142 was specifically designed to prevent. Changing the enforcement algorithm requires re-assessing whether the hazard is still adequately mitigated.',
    confidenceExplanation: 'Deducted 12% — hazard itself is unchanged, but the control effectiveness must be re-verified post-change.',
    ruledOut: [
      { item: 'HAZ-031 (Air Embolism)', reason: 'Unrelated hazard. No shared controls with rate limit enforcement.' },
    ],
  },
  'risk-047a': {
    tools: [
      { call: 'query_risk_register("RISK-047-A")', resultText: 'Direct implementing requirement found', links: ['REQ-142'] },
      { call: 'check_verification_tests("RISK-047-A")', resultText: 'Linked verification test found', links: ['TEST-V-340'] },
    ],
    reasoning: 'RISK-047-A is directly implemented by REQ-142. The risk control\'s effectiveness depends on the enforcement algorithm behaving correctly. The algorithm change invalidates the current verification evidence.',
    confidenceExplanation: 'High confidence — explicit one-to-one link in risk register. Re-verification is unambiguously required.',
    ruledOut: [
      { item: 'RISK-022 (Battery Failure)', reason: 'Hardware risk, no software dependency on rate limiter.' },
    ],
  },
  'risk-047b': {
    tools: [
      { call: 'query_risk_register("RISK-047-B")', resultText: 'Linked to hazard, independent alarm mechanism', links: ['HAZ-047'] },
      { call: 'check_implementation_source("RISK-047-B")', resultText: 'Alarm module is separate from rate limit enforcement module' },
    ],
    reasoning: 'RISK-047-B is the alarm control for the same hazard. It operates independently of the enforcement algorithm — the alarm triggers on rate breach detection, not on the enforcement logic itself.',
    confidenceExplanation: 'Deducted 15% — while the alarm is architecturally independent, a regression risk exists if the breach detection signal is produced by the changed module.',
    ruledOut: [
      { item: 'SPEC-HW-105', reason: 'Alarm is a software trigger, not dependent on motor controller timing.' },
    ],
  },
  'spec-sw230': {
    tools: [
      { call: 'search_design_specs("REQ-142")', resultText: 'Implementing design spec found', links: ['SPEC-SW-230'] },
      { call: 'check_spec_revision("SPEC-SW-230")', resultText: 'Currently r4 draft — in-progress update' },
    ],
    reasoning: 'SPEC-SW-230 is the detailed software design for the rate limiter module. It directly documents the algorithm being changed and must be updated to reflect the new implementation.',
    confidenceExplanation: 'High confidence — direct implementation link. Already in draft revision, confirming it is in-scope.',
    ruledOut: [
      { item: 'SPEC-SW-180 (Alarm Module Design)', reason: 'Separate module spec, no shared implementation with rate limiter.' },
    ],
  },
  'test-v340': {
    tools: [
      { call: 'check_verification_tests("REQ-142")', resultText: 'Directly linked boundary test found', links: ['TEST-V-340'] },
      { call: 'get_test_last_run("TEST-V-340")', resultText: 'Last run 2024-11-03 against v2.1 — now outdated' },
    ],
    reasoning: 'TEST-V-340 validates the exact boundary behaviour of the rate limit enforcement. Since the algorithm changed, the test results from v2.1 are no longer valid evidence.',
    confidenceExplanation: 'Near-certain — test is directly linked and explicitly validates the changed logic. Last run predates the change.',
    ruledOut: [
      { item: 'TEST-V-290 (Battery Drain Test)', reason: 'No dependency on rate limit enforcement logic.' },
    ],
  },
  'test-v341': {
    tools: [
      { call: 'check_verification_tests("RISK-047-B")', resultText: 'Linked to alarm control', links: ['TEST-V-341'] },
      { call: 'check_implementation_source("alarm trigger")', resultText: 'Alarm trigger independent of enforcement algorithm' },
    ],
    reasoning: 'TEST-V-341 tests the alarm and pump stop behaviour on limit breach. The alarm mechanism is architecturally separate, but a regression test is recommended to confirm the breach signal is still correctly emitted by the updated module.',
    confidenceExplanation: 'Deducted 13% — test is not directly linked to the changed code path, but shares the same hazard chain.',
    ruledOut: [
      { item: 'TEST-V-200 (Drug Library Load Test)', reason: 'No dependency on alarm or enforcement logic.' },
    ],
  },
  'sop-015': {
    tools: [
      { call: 'query_change_control_sop()', resultText: 'Governing SOP found', links: ['SOP-QMS-015'] },
      { call: 'check_sop_triggers("software algorithm change")', resultText: 'Section 4.2 requires re-review for safety-critical algorithm changes' },
    ],
    reasoning: 'Any change to a safety-critical software module triggers the change control SOP. The SOP review ensures the change package is complete before QA sign-off.',
    confidenceExplanation: 'Deducted 18% — SOP applicability is procedural, not directly traceable. Confidence based on change classification as safety-critical.',
    ruledOut: [
      { item: 'SOP-QMS-008 (Hardware Change Control)', reason: 'Software-only change. Hardware SOP not triggered.' },
    ],
  },
  'iec-62304': {
    tools: [
      { call: 'map_requirement_to_standard("REQ-142", "IEC 62304")', resultText: '§5.3 applies — detailed design must address safety requirements' },
      { call: 'check_compliance_evidence("IEC 62304 §5.3")', resultText: 'Current evidence artifacts found', links: ['SPEC-SW-230', 'TEST-V-340'] },
    ],
    reasoning: 'IEC 62304 §5.3 requires that detailed software design addresses all safety requirements. SPEC-SW-230 is the evidence artifact. Since it is being updated, compliance traceability must be re-confirmed after the revision.',
    confidenceExplanation: 'Near-certain — direct standard-to-artifact mapping exists. Compliance is currently maintained but must be re-verified post-update.',
    ruledOut: [
      { item: 'IEC 62304 §5.1 (Software Development Planning)', reason: 'Planning phase complete. Change is in implementation phase.' },
    ],
  },
  'iso-14971': {
    tools: [
      { call: 'map_risk_control_to_standard("RISK-047-A", "ISO 14971")', resultText: '§6.3 requires post-change verification of risk control effectiveness', links: ['RISK-047-A'] },
      { call: 'check_residual_risk_evidence("HAZ-047")', resultText: 'Residual risk acceptance now outdated', links: ['TEST-V-340'] },
    ],
    reasoning: 'ISO 14971 §6.3 requires verifying that risk controls remain effective after a change. Since RISK-047-A is directly affected and TEST-V-340 is outdated, the residual risk acceptance is currently unsupported by valid evidence.',
    confidenceExplanation: 'Deducted 21% — the standard applies clearly, but the exact scope of re-verification required is subject to QA interpretation.',
    ruledOut: [
      { item: 'ISO 14971 §4 (Risk Analysis)', reason: 'Hazard identification phase complete. No new hazards identified from this change.' },
    ],
  },
  'spec-hw105': {
    tools: [
      { call: 'check_interface_spec("SPEC-SW-230", "SPEC-HW-105")', resultText: 'Interface exists but no direct dependency on enforcement algorithm', links: ['SPEC-SW-230', 'SPEC-HW-105'] },
      { call: 'query_change_log("motor controller")', resultText: 'No changes in last 12 months' },
    ],
    reasoning: 'The rate limiter module communicates with the motor controller via a defined interface. The enforcement algorithm change does not alter the interface contract, but timing characteristics may shift under edge conditions.',
    confidenceExplanation: 'Low-medium confidence — no explicit traceability link. Flagged based on architectural proximity. Human review recommended.',
    ruledOut: [],
  },
  'test-v210': {
    tools: [
      { call: 'search_traceability_db("REQ-085")', resultText: 'Linked to drug library validation', links: ['TEST-V-210'] },
      { call: 'check_test_scope("TEST-V-210", "REQ-142")', resultText: 'No direct link — indirect via shared drug library data' },
    ],
    reasoning: 'TEST-V-210 validates that drug library updates do not bypass rate limits. The enforcement change could theoretically alter how library limits are applied, but no direct dependency was found.',
    confidenceExplanation: 'Medium confidence — indirect relationship via shared data. Flagged as secondary for human judgment.',
    ruledOut: [],
  },
  'ui-spec088': {
    tools: [
      { call: 'search_design_specs("rate entry")', resultText: 'Rate entry screen spec found', links: ['UI-SPEC-088'] },
      { call: 'check_ui_backend_coupling("rate limit enforcement")', resultText: 'No direct API coupling found between UI and enforcement module' },
    ],
    reasoning: 'The rate entry screen is the user-facing component for entering infusion rates. While it feeds data into the system that the enforcement algorithm acts on, no direct coupling to the algorithm was found.',
    confidenceExplanation: 'Low confidence — flagged based on functional proximity, not traceability. The UI validation logic could mask or expose enforcement changes in edge cases.',
    ruledOut: [],
  },
  'dhf-024': {
    tools: [
      { call: 'query_dhf_contents("REQ-142")', resultText: 'DHF references these artifacts', links: ['REQ-142', 'SPEC-SW-230', 'TEST-V-340'] },
      { call: 'check_dhf_update_policy()', resultText: 'DHF must be updated when any linked artifact changes status' },
    ],
    reasoning: 'The Design History File aggregates all linked artifacts. Since multiple primary artifacts are stale, the DHF will require an update as part of change closure.',
    confidenceExplanation: 'Medium confidence — DHF update is a procedural consequence, not a technical dependency. Flagged for regulatory completeness.',
    ruledOut: [],
  },
}

export type RunResult = 'passed' | 'failed-bug' | 'failed-test-change' | 'failed-infra'

export interface TestRun {
  timestamp: string
  result: RunResult
}

export const TEST_RUN_HISTORY: Record<string, TestRun[]> = {
  'test-v340': [
    { timestamp: '2024-11-03 14:22', result: 'failed-test-change' },
    { timestamp: '2024-10-18 09:41', result: 'passed' },
    { timestamp: '2024-10-02 11:05', result: 'passed' },
    { timestamp: '2024-09-17 16:33', result: 'passed' },
    { timestamp: '2024-09-01 10:12', result: 'failed-infra' },
  ],
  'test-v341': [
    { timestamp: '2024-11-03 14:25', result: 'passed' },
    { timestamp: '2024-10-18 09:45', result: 'passed' },
    { timestamp: '2024-10-02 11:10', result: 'passed' },
    { timestamp: '2024-09-17 16:38', result: 'passed' },
    { timestamp: '2024-09-01 10:18', result: 'passed' },
  ],
  'test-v210': [
    { timestamp: '2024-11-15 11:32', result: 'failed-bug' },
    { timestamp: '2024-10-15 13:20', result: 'failed-bug' },
    { timestamp: '2024-09-30 10:44', result: 'passed' },
    { timestamp: '2024-09-14 15:02', result: 'passed' },
    { timestamp: '2024-08-29 09:30', result: 'failed-infra' },
  ],
}

export interface NodeDraft {
  title: string
  content: string
}

export const NODE_DRAFTS: Record<string, NodeDraft> = {
  'risk-047a': {
    title: 'RISK-047-A — Rate Limit Control (Revised)',
    content: `Risk Control: Software enforcement of maximum infusion rate limit.\n\nRevised control statement: The software shall enforce an absolute upper infusion rate limit of [NEW_LIMIT] mL/hr as defined in REQ-142 rev 3.1. Any attempted programming above this limit shall be rejected by the system and an audible/visual alert shall be triggered.\n\nVerification method: Boundary value testing per TEST-V-340 (updated). Re-verification required against REQ-142 rev 3.1 before change closure.\n\nRisk acceptability: Residual risk remains acceptable provided re-verification passes. Risk owner: Systems Engineering.`,
  },
  'risk-047b': {
    title: 'RISK-047-B — Alarm on Violation (Review note)',
    content: `Risk Control: Alarm triggered on rate limit violation.\n\nThe alarm mechanism operates independently of the enforcement algorithm. No changes to alarm logic are required as a result of REQ-142 rev 3.1.\n\nConfirmation required: QA to confirm alarm threshold parameters remain within tolerance after enforcement algorithm update. Evidence: TEST-V-341 last run 2024-11-03 — passed.`,
  },
  'spec-sw230': {
    title: 'SPEC-SW-230 — Rate Limiter Software Design (Revised)',
    content: `Section 4.2 — Rate Limit Enforcement Module\n\nRevised design: The rate limiter module shall implement the updated enforcement algorithm as specified in REQ-142 rev 3.1. The enforcement boundary shall be parameterised and read from the device configuration store at startup.\n\nAffected modules: RateLimiterCore.c, ConfigManager.c\nInterfaces: No changes to external hardware interfaces (confirmed SPEC-HW-105 unaffected).\n\nChange justification: Algorithm update required to address clinical feedback on rate precision at boundary values. Full impact assessed via CIA-2024-047.`,
  },
  'test-v340': {
    title: 'TEST-V-340 — Rate Limit Boundary Test (Updated)',
    content: `Test protocol update for REQ-142 rev 3.1.\n\nTest objective: Verify the infusion pump rejects all rate inputs above the revised limit and accepts all inputs at or below it.\n\nUpdated boundary values: [NEW_LIMIT] mL/hr ± 0.1 mL/hr. Previous boundary values are no longer valid.\n\nTest cases to update:\n- TC-340-01: Input at exact limit → expect ACCEPT\n- TC-340-02: Input at limit + 0.1 → expect REJECT + alert\n- TC-340-03: Input at limit − 0.1 → expect ACCEPT\n\nRe-run required before change closure. Tester: QA Lab.`,
  },
  'test-v341': {
    title: 'TEST-V-341 — Overdose Prevention Test (No change required)',
    content: `Test protocol review for REQ-142 rev 3.1 impact.\n\nConclusion: No update required. TEST-V-341 validates the alarm and pump-stop behaviour on limit breach. This logic is implemented independently of the enforcement algorithm (RISK-047-B confirmed unaffected).\n\nLast run: 2024-11-03 — Passed. Evidence remains valid. No re-run required unless alarm threshold parameters are modified.`,
  },
  'sop-qms015': {
    title: 'SOP-QMS-015 — Software Change Control (Update required)',
    content: `Section 6.3 — Impact Assessment for Safety-Critical Changes\n\nAddendum: Changes to enforcement algorithm parameters (e.g. rate limit values) are classified as safety-critical and require a full CIA prior to implementation. The CIA output must include: affected artifact list, agent confidence scores, and human acceptance record for each impacted item.\n\nThis addendum applies retroactively to CIA-2024-047 (REQ-142 rev 3.1). Change control record to be updated by QA before submission.`,
  },
  'iec-62304': {
    title: 'IEC 62304 §5.3 — Compliance Justification (Updated)',
    content: `Standard: IEC 62304:2006+AMD1:2015, §5.3 Software Detailed Design\n\nCompliance statement: SPEC-SW-230 rev 3.1 (in progress) will constitute the detailed design evidence for the rate limiter module following the REQ-142 change. Compliance is currently under review pending SPEC-SW-230 revision approval.\n\nExpected closure: Upon approval of SPEC-SW-230 rev 3.1 and successful re-run of TEST-V-340. Regulatory traceability record to be updated in DHF (DOC-DHF-024).`,
  },
  'iso-14971': {
    title: 'ISO 14971 §6.3 — Risk Control Verification (Updated)',
    content: `Standard: ISO 14971:2019, §6.3 Verification of implementation and effectiveness of risk controls\n\nCompliance gap: RISK-047-A re-verification is pending. Current evidence (TEST-V-340, last run 2024-11-03 against v2.1) is no longer valid following REQ-142 rev 3.1.\n\nRequired action: Re-run TEST-V-340 against updated boundary values. Upon pass, update risk control effectiveness record and residual risk acceptance in the Risk Management File. Responsible: Systems Engineering + QA.`,
  },
  'spec-hw105': {
    title: 'SPEC-HW-105 — Motor Controller Interface (No change required)',
    content: `Interface review for REQ-142 rev 3.1 impact.\n\nConclusion: No update required. The motor controller interface specification is not dependent on the software enforcement algorithm. Rate commands are passed via the existing API without modification.\n\nReview basis: check_interface_spec confirmed no direct dependency. No changes to SPEC-HW-105 required for this change.`,
  },
  'test-v210': {
    title: 'TEST-V-210 — Drug Library Update Test (Review recommended)',
    content: `Secondary impact review for REQ-142 rev 3.1.\n\nThe drug library update flow includes rate validation checks that may reference the enforcement limit indirectly. Manual review recommended to confirm no dependency on the updated boundary value.\n\nIf dependency confirmed: update test inputs to reflect new limit and re-run. If no dependency confirmed: mark as reviewed with no change required.`,
  },
  'ui-spec088': {
    title: 'UI-SPEC-088 — Rate Entry Screen (Review recommended)',
    content: `Secondary impact review for REQ-142 rev 3.1.\n\nThe rate entry screen displays and validates user input against the rate limit. If the limit value is displayed or used as a validation boundary in the UI, the screen specification must be updated to reflect the new value.\n\nRecommended action: confirm whether the rate limit value is hardcoded or read from configuration in the UI layer. Update UI validation logic and display strings if required.`,
  },
  'doc-dhf024': {
    title: 'DOC-DHF-024 — Design History File (Update required)',
    content: `Design History File update for CIA-2024-047 (REQ-142 rev 3.1).\n\nArtifacts to be added or updated in this DHF entry:\n- REQ-142 rev 3.1 (change origin)\n- SPEC-SW-230 rev 3.1 (design evidence)\n- TEST-V-340 updated protocol + new run results\n- RISK-047-A re-verification record\n- ISO 14971 §6.3 residual risk acceptance\n- IEC 62304 §5.3 compliance confirmation\n- SOP-QMS-015 addendum\n- CIA-2024-047 acceptance record (this document)\n\nDHF update owner: Regulatory Affairs. Target closure: upon acceptance of all primary artifacts.`,
  },
}

export const DEFAULT_EDGES: Edge[] = [
  // Root → direct impacts
  { id: 'e3', source: 'req-142', target: 'haz-047',    type: 'smoothstep', label: 'addresses',   style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e4', source: 'req-142', target: 'risk-047a',  type: 'smoothstep', label: 'fulfills',    style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e5', source: 'req-142', target: 'risk-047b',  type: 'smoothstep', label: 'fulfills',    style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e6', source: 'req-142', target: 'spec-sw230', type: 'smoothstep', label: 'implements',  style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },

  // Risk controls → tests
  { id: 'e7', source: 'risk-047a',  target: 'test-v340', type: 'smoothstep', label: 'validated by', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e8', source: 'risk-047b',  target: 'test-v341', type: 'smoothstep', label: 'validated by', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e9', source: 'spec-sw230', target: 'test-v340', type: 'smoothstep', label: 'tested by',    style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },

  // Tests → SOP
  { id: 'e10', source: 'test-v340', target: 'sop-015', type: 'smoothstep', label: 'approved under', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e11', source: 'test-v341', target: 'sop-015', type: 'smoothstep', label: 'approved under', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },

  // SOP → regulatory
  { id: 'e12', source: 'sop-015', target: 'iec-62304', type: 'smoothstep', label: 'implements', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },
  { id: 'e13', source: 'sop-015', target: 'iso-14971', type: 'smoothstep', label: 'implements', style: { stroke: '#000' }, markerEnd: { type: 'arrowclosed', color: '#000' } },

  // Secondary suggestions (dashed)
  { id: 'e14', source: 'spec-sw230', target: 'spec-hw105', type: 'smoothstep', animated: true, style: { strokeDasharray: '5 5', stroke: '#aaa' } },
  { id: 'e15', source: 'req-142',    target: 'test-v210',  type: 'smoothstep', animated: true, style: { strokeDasharray: '5 5', stroke: '#aaa' } },
  { id: 'e16', source: 'req-142',    target: 'ui-spec088', type: 'smoothstep', animated: true, style: { strokeDasharray: '5 5', stroke: '#aaa' } },
  { id: 'e17', source: 'iso-14971',  target: 'dhf-024',    type: 'smoothstep', animated: true, style: { strokeDasharray: '5 5', stroke: '#aaa' } },
]

// ─── Chat messages ────────────────────────────────────────────────────────────

import type { ChatMessage } from '@/components/chat'

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { id: 1, from: 'me',   text: 'I merged PR #847 (KTX-2047) — updated the infusion rate limit enforcement algorithm. Can you run a full downstream change impact analysis for REQ-142?' },
  { id: 2, from: 'them', text: 'I detected the merge of PR #847 linked to KTX-2047 and have already started the analysis.\n\nDownstream Impact Analysis complete. The impact graph has been populated.\n\nI identified 12 affected artifacts across requirements, risk controls, verification tests, and regulatory mappings.\n\nFour items are flagged as stale and require immediate attention — RISK-047-A, SPEC-SW-230, and TEST-V-340 are directly invalidated by the algorithm change.\n\nI\'ve also surfaced 4 secondary items with lower confidence scores for your review.' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Flow({
  initialNodes = DEFAULT_NODES,
  initialEdges = DEFAULT_EDGES,
  edgeType = 'smoothstep',
  showControls = true,
  showBackground = true,
  onNodeClick,
  selectedNodeId,
  nodeOverrides = {},
}: FlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  useEffect(() => {
    if (Object.keys(nodeOverrides).length === 0) return
    setNodes(nds => nds.map(n => {
      if (!nodeOverrides[n.id]) return n
      const { _type, ...dataOverrides } = nodeOverrides[n.id]
      return {
        ...n,
        ...(typeof _type === 'string' ? { type: _type } : {}),
        data: { ...n.data, ...dataOverrides },
      }
    }))
  }, [nodeOverrides, setNodes])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    if (!selectedNodeId) {
      setNodes(nds => nds.map(n => ({ ...n, selected: false })))
    }
  }, [selectedNodeId, setNodes])

  const handleConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, type: edgeType }, eds))
  }, [edgeType, setEdges])

  const handleReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
  }, [setEdges])

  const handleReconnectEnd = useCallback((
    _evt: unknown,
    edge: Edge,
    _handleType: unknown,
    connectionState: { isValid: boolean | null }
  ) => {
    if (!connectionState.isValid) {
      setEdges(eds => eds.some(e => e.id === edge.id) ? eds : [...eds, edge])
    }
  }, [setEdges])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onReconnect={handleReconnect}
        onReconnectEnd={handleReconnectEnd}
        onNodeClick={(_evt, node) => onNodeClick?.(node)}
        edgesReconnectable
        reconnectRadius={40}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 60, y: 60, zoom: 0.85 }}
      >
        {showBackground && <Background />}
        {showControls   && <Controls />}
      </ReactFlow>
    </div>
  )
}
