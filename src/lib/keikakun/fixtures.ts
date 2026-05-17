import type {
  EvidenceArtifact,
  EvidenceGap,
  JobRequirement,
  KeyFinding,
  PlanWeek,
  RequirementCoverage,
  SkillMatch
} from "./types";

export type FixtureVariant = "medium-main" | "high-match" | "low-match";

export interface FixtureCase {
  variant: FixtureVariant;
  careerHistoryText: string;
  jobPostingText: string;
  targetRole: string;
  profileSummary: string;
  jobSummary: string;
  requirements: JobRequirement[];
  requirementCoverage: RequirementCoverage[];
  evidenceGaps: EvidenceGap[];
  keyFindings: KeyFinding[];
  skillMatches: SkillMatch[];
  planWeeks: PlanWeek[];
  evidenceArtifacts: EvidenceArtifact[];
  nextAction: string;
}

export function getFixtureCase(variant: FixtureVariant = "medium-main"): FixtureCase {
  const requirements = createRequirements();
  const evidenceGaps = createEvidenceGaps();

  if (variant === "high-match") {
    const coverage = createHighCoverage();
    const planWeeks = createPlanWeeks(evidenceGaps, true);

    return {
      variant,
      careerHistoryText: highMatchCareerHistoryText,
      jobPostingText: sampleJobPostingText,
      targetRole: "Product Operations Associate",
      profileSummary:
        "BtoB SaaS の CS 経験をもとに、利用データ分析、フィードバックループ、改善施策の推進まで説明できる候補者。",
      jobSummary:
        "顧客インサイト、利用データ、社内プロセスをつなぎ、Product Operations の実務を支えるポジション。",
      requirements,
      requirementCoverage: coverage,
      evidenceGaps,
      keyFindings: createKeyFindings("high-match"),
      skillMatches: createSkillMatches("high-match"),
      planWeeks,
      evidenceArtifacts: createEvidenceArtifacts(evidenceGaps),
      nextAction:
        "既に近い経験があります。最初の7日間は、改善施策の数字と判断理由を1枚のケースメモに整理してください。"
    };
  }

  if (variant === "low-match") {
    const coverage = createLowCoverage();
    const planWeeks = createPlanWeeks(evidenceGaps, false);

    return {
      variant,
      careerHistoryText: lowMatchCareerHistoryText,
      jobPostingText: sampleJobPostingText,
      targetRole: "Product Operations Associate",
      profileSummary:
        "顧客対応の実行経験はあるが、分析、改善設計、成果の証拠がまだ薄い候補者。",
      jobSummary:
        "顧客インサイト、利用データ、社内プロセスをつなぎ、Product Operations の実務を支えるポジション。",
      requirements,
      requirementCoverage: coverage,
      evidenceGaps,
      keyFindings: createKeyFindings("low-match"),
      skillMatches: createSkillMatches("low-match"),
      planWeeks,
      evidenceArtifacts: createEvidenceArtifacts(evidenceGaps),
      nextAction:
        "まず必須要件に近い経験を作る必要があります。最初の7日間は、顧客問い合わせを10件分類し、課題カテゴリを見える化してください。"
    };
  }

  const coverage = createMediumCoverage();
  const planWeeks = createPlanWeeks(evidenceGaps, true);

  return {
    variant,
    careerHistoryText: mediumCareerHistoryText,
    jobPostingText: sampleJobPostingText,
    targetRole: "Product Operations Associate",
    profileSummary:
      "BtoB SaaS のカスタマーサクセスとして、オンボーディング、問い合わせ整理、更新リスク対応を担当。Product Operations へ移るには、分析と成果証拠の補強が必要。",
    jobSummary:
      "顧客の声と利用データを整理し、プロダクト改善と業務プロセス改善を支える Product Operations Associate。",
    requirements,
    requirementCoverage: coverage,
    evidenceGaps,
    keyFindings: createKeyFindings("medium-main"),
    skillMatches: createSkillMatches("medium-main"),
    planWeeks,
    evidenceArtifacts: createEvidenceArtifacts(evidenceGaps),
    nextAction:
      "最初の7日間は、問い合わせ・要望・解約リスクの記録を20件だけ分類し、改善候補を3つに絞ってください。"
  };
}

export const mediumCareerHistoryText = `BtoB SaaS のカスタマーサクセスとして3年半勤務。新規顧客のオンボーディング、利用開始後の問い合わせ対応、更新前のリスク確認を担当してきました。営業、サポート、プロダクトチームと連携し、顧客から繰り返し出る要望や不具合の傾向をスプレッドシートに整理して、週次の共有メモとして提出していました。

直近では、ヘルプデスクの問い合わせをカテゴリ別に整理し、初期設定でつまずく顧客が多い手順を社内 FAQ に反映しました。数値成果はまだ粗いですが、オンボーディング中の質問数が減った感覚はあります。CRM のエクスポートや利用状況 CSV を見て、更新リスクのある顧客を見つける作業も一部担当しました。

今後は、顧客対応だけでなく、顧客インサイトをプロダクト改善や業務プロセスに接続する Product Operations / Customer Success Operations に移りたいと考えています。SQL や BI は学習中で、まだ業務で直接使った経験は少ないです。`;

export const highMatchCareerHistoryText = `BtoB SaaS のカスタマーサクセスとして4年勤務し、オンボーディング、利用データ分析、更新リスク対応、プロダクトフィードバックの運用改善を担当しました。CRM とヘルプデスクのエクスポートを統合し、問い合わせカテゴリ、利用頻度、更新リスクを週次で可視化するレポートを作成しました。

プロダクトチームとは月次で改善候補をレビューし、顧客要望を重要度、頻度、売上影響で整理するフィードバックループを設計しました。FAQ 改善と初期設定ガイドの見直しにより、オンボーディング初月の問い合わせを約18%削減しました。SQL は基礎的な SELECT と集計を使い、BI ダッシュボードの要件整理も担当しています。

現在は Product Operations Associate として、顧客インサイト、利用データ、社内プロセスをつなぐ仕事に移る準備をしています。`;

export const lowMatchCareerHistoryText = `BtoB SaaS のサポート担当として2年勤務。顧客からの問い合わせに返信し、設定方法や基本操作を案内していました。必要に応じて営業やプロダクトチームへ連絡し、顧客の困りごとを共有しました。

業務ではヘルプデスクを使っていましたが、問い合わせの傾向分析やレポート作成は主担当ではありません。スプレッドシートは簡単な一覧管理で使う程度です。SQL、BI、プロダクト改善の会議運営は未経験です。

今後はカスタマーサクセスやオペレーション寄りの職種に広げたいと考えていますが、まだ成果物や定量的な実績は十分に整理できていません。`;

export const sampleJobPostingText = `Product Operations Associate を募集します。顧客の声、サポート問い合わせ、利用データをもとに、プロダクト改善と社内オペレーション改善を支える役割です。カスタマーサクセス、サポート、営業、プロダクトチームの間に入り、課題の優先度を整理し、改善の進捗を見える化します。

必須要件は、顧客インサイトを整理して課題に変換できること、サポートや利用データを分析できること、プロダクトへのフィードバックループを設計または改善した経験、社内プロセス改善の経験、関係者との分かりやすいコミュニケーション、スプレッドシートまたは BI でのレポート作成、基礎的な SQL またはデータリテラシーです。

歓迎要件は、AI ツールや自動化への関心、Product Operations のドキュメント整備経験、日本語でのビジネスコミュニケーションと英語ドキュメント読解力です。`;

function createRequirements(): JobRequirement[] {
  return [
    requirement("req-insight", "顧客インサイトを整理して課題に変換できる", "required", "product", 5, 1, [
      "customer insight synthesis"
    ]),
    requirement("req-data", "サポートや利用データを分析できる", "required", "data", 5, 0.9, [
      "analytics",
      "CRM export analysis"
    ]),
    requirement("req-feedback", "プロダクトへのフィードバックループを設計または改善した経験", "required", "product", 5, 0.9, [
      "feedback loop design"
    ]),
    requirement("req-process", "社内プロセス改善の経験", "required", "process", 4, 0.8, [
      "operations improvement",
      "process design"
    ]),
    requirement("req-stakeholder", "関係者との分かりやすいコミュニケーション", "required", "collaboration", 4, 0.8, [
      "stakeholder analysis",
      "business communication"
    ]),
    requirement("req-reporting", "スプレッドシートまたは BI でのレポート作成", "required", "data", 4, 0.7, [
      "spreadsheet analysis",
      "BI tools"
    ]),
    requirement("req-sql", "基礎的な SQL またはデータリテラシー", "required", "data", 4, 0.7, [
      "SQL"
    ]),
    requirement("pref-ai", "AI ツールや自動化への関心", "preferred", "ai", 3, 0.5, [
      "AI workflow design"
    ]),
    requirement("pref-docs", "Product Operations のドキュメント整備経験", "preferred", "product", 3, 0.4, [
      "decision documentation"
    ]),
    requirement("pref-language", "日本語でのビジネスコミュニケーションと英語ドキュメント読解力", "preferred", "language", 2, 0.3, [
      "Japanese business communication",
      "English documentation"
    ])
  ];
}

function createMediumCoverage(): RequirementCoverage[] {
  return [
    coverage("req-insight", "matched", "moderate", ["顧客要望を週次メモに整理"], "要望整理はあるが、課題化と優先度の証拠がまだ弱い。", []),
    coverage("req-data", "partial", "moderate", ["CRM と利用状況 CSV の確認"], "分析というより確認作業に近い。集計軸を明確にする必要がある。", ["CRM export analysis"]),
    coverage("req-feedback", "partial", "moderate", ["プロダクトチームへの共有"], "共有はあるが、フィードバックループを設計した証拠は薄い。", ["customer success"]),
    coverage("req-process", "matched", "moderate", ["FAQ 反映と手順改善"], "改善経験はある。効果測定が弱い。", []),
    coverage("req-stakeholder", "matched", "strong", ["営業・サポート・プロダクトとの連携"], "複数部門と動いた経験は明確。", []),
    coverage("req-reporting", "partial", "moderate", ["スプレッドシートで要望整理"], "レポートというより一覧化。意思決定に使った証拠を追加したい。", ["spreadsheet analysis"]),
    coverage("req-sql", "partial", "moderate", ["SQL は学習中、CSV 分析は一部担当"], "SQL の業務証拠がない。小さな分析成果物が必要。", ["CRM export analysis"]),
    coverage("pref-ai", "partial", "weak", ["AI への関心"], "関心はあるが成果物がない。", ["AI workflow design"]),
    coverage("pref-docs", "partial", "weak", ["社内 FAQ 反映"], "Product Ops 文書としての構造はまだ弱い。", ["decision documentation"]),
    coverage("pref-language", "matched", "moderate", ["日本語での顧客・社内調整"], "日本語コミュニケーションは十分。英語読解は補足が必要。", [])
  ];
}

function createHighCoverage(): RequirementCoverage[] {
  return [
    coverage("req-insight", "matched", "strong", ["重要度・頻度・売上影響で顧客要望を整理"], "課題化と優先度付けの証拠がある。", []),
    coverage("req-data", "matched", "strong", ["CRM とヘルプデスクを統合した週次レポート"], "分析対象と用途が明確。", []),
    coverage("req-feedback", "matched", "strong", ["月次レビューのフィードバックループを設計"], "Product Ops に近い経験。", []),
    coverage("req-process", "matched", "strong", ["FAQ と初期設定ガイド改善で問い合わせ18%削減"], "成果が定量化されている。", []),
    coverage("req-stakeholder", "matched", "strong", ["CS、営業、プロダクト間で改善候補を調整"], "関係者調整の証拠が強い。", []),
    coverage("req-reporting", "matched", "moderate", ["BI ダッシュボード要件整理"], "BI の直接構築までは弱いが十分に近い。", []),
    coverage("req-sql", "partial", "moderate", ["基礎的な SELECT と集計"], "高度な SQL ではないが基礎証拠がある。", ["CRM export analysis"]),
    coverage("pref-ai", "partial", "weak", ["自動化への関心"], "AI 活用成果物はまだない。", ["AI workflow design"]),
    coverage("pref-docs", "matched", "moderate", ["改善候補レビュー資料"], "運用ドキュメントの証拠がある。", []),
    coverage("pref-language", "matched", "moderate", ["日本語での部門間調整"], "英語文書の証拠を足すとさらに良い。", [])
  ];
}

function createLowCoverage(): RequirementCoverage[] {
  return [
    coverage("req-insight", "partial", "weak", ["顧客の困りごとを共有"], "課題化や優先度付けの証拠が弱い。", ["customer success"]),
    coverage("req-data", "partial", "weak", ["ヘルプデスクで問い合わせを確認"], "分析を主担当として行った証拠は弱い。", ["CRM export analysis"]),
    coverage("req-feedback", "partial", "weak", ["顧客の困りごとを社内共有"], "プロダクト改善ループの設計経験はない。", ["customer success"]),
    coverage("req-process", "partial", "weak", ["基本操作案内"], "改善ではなく日々の実行に近い。", []),
    coverage("req-stakeholder", "partial", "weak", ["必要に応じて社内連絡"], "調整の複雑さや判断が見えない。", []),
    coverage("req-reporting", "partial", "weak", ["簡単な一覧管理"], "レポート作成としては弱い。", ["spreadsheet analysis"]),
    coverage("req-sql", "partial", "weak", ["一覧管理の経験"], "SQL または分析成果物がない。", ["spreadsheet analysis"]),
    coverage("pref-ai", "partial", "weak", ["オペレーション職種への関心"], "AI 活用の証拠はない。", ["AI workflow design"]),
    coverage("pref-docs", "partial", "weak", ["問い合わせ共有メモ"], "Product Ops 文書の証拠としては弱い。", ["decision documentation"]),
    coverage("pref-language", "matched", "moderate", ["日本語での顧客対応"], "日本語での業務対応は確認できる。", [])
  ];
}

function createEvidenceGaps(): EvidenceGap[] {
  return [
    {
      gapKey: "gap-data-report",
      linkedRequirementKey: "req-data",
      title: "利用データ分析の小さな成果物",
      whyItMatters: "Product Operations は感覚ではなく、顧客行動や問い合わせ傾向を根拠に改善を進めるため。",
      evidenceToCreate: "問い合わせ20件をカテゴリ化し、頻度・影響・改善候補を1枚に整理する。",
      difficulty: "medium",
      expectedImpact: "high"
    },
    {
      gapKey: "gap-feedback-loop",
      linkedRequirementKey: "req-feedback",
      title: "プロダクトフィードバックループの設計メモ",
      whyItMatters: "単なる共有ではなく、誰が何を見て判断するかを設計できることを示すため。",
      evidenceToCreate: "顧客要望を受けてから改善候補にするまでの流れを図解する。",
      difficulty: "medium",
      expectedImpact: "high"
    },
    {
      gapKey: "gap-sql",
      linkedRequirementKey: "req-sql",
      title: "SQL または BI の基礎分析証拠",
      whyItMatters: "データリテラシー要件に対して、学習中だけでは証拠として弱いため。",
      evidenceToCreate: "架空の利用ログを SQL で集計し、解釈と次アクションを書く。",
      difficulty: "high",
      expectedImpact: "high"
    },
    {
      gapKey: "gap-quantified-outcome",
      linkedRequirementKey: "req-process",
      title: "改善効果の定量化",
      whyItMatters: "改善経験を Product Ops の証拠として見せるには、前後比較か判断材料が必要なため。",
      evidenceToCreate: "FAQ 改善前後の問い合わせ件数、対応時間、再問い合わせ率のどれかを推定でもよいので整理する。",
      difficulty: "medium",
      expectedImpact: "high"
    }
  ];
}

function createKeyFindings(variant: FixtureVariant): KeyFinding[] {
  if (variant === "low-match") {
    return [
      finding("strength", "顧客対応の現場理解", "問い合わせ対応の経験は、顧客課題を理解する土台になる。"),
      finding("priority_gap", "分析と改善設計の主担当経験", "Product Operations の必須要件に対して、主導した証拠が不足している。"),
      finding("evidence_needed", "問い合わせ分類の成果物", "小さくてもよいので、顧客の声を構造化した証拠が必要。")
    ];
  }

  if (variant === "high-match") {
    return [
      finding("strength", "顧客インサイトから改善までの接続", "要望整理、レポート、レビュー運用がつながっている。"),
      finding("priority_gap", "AI 活用と SQL の深さ", "強い候補だが、AI/SQL は補助的な証拠に留まる。"),
      finding("evidence_needed", "改善施策のケースメモ", "18%削減の背景と判断を1枚で説明できるようにする。")
    ];
  }

  return [
    finding("strength", "CS から Product Ops への転用可能性", "顧客要望整理、FAQ 改善、部門連携は目標職種に近い。"),
    finding("priority_gap", "データ分析とフィードバックループ", "分析、SQL、改善プロセス設計の証拠がまだ弱い。"),
    finding("evidence_needed", "小さな分析成果物", "問い合わせ分類と改善候補のメモを作ると、面接で話せる証拠になる。")
  ];
}

function createSkillMatches(variant: FixtureVariant): SkillMatch[] {
  const base: SkillMatch[] = [
    skillMatch("skill-cs", "customer success", "matched", "profile", ["オンボーディングと更新リスク対応"], "alias/direct role evidence"),
    skillMatch("skill-stakeholder", "stakeholder analysis", "matched", "profile", ["営業・サポート・プロダクト連携"], "alias match: ステークホルダー調整"),
    skillMatch("skill-crm", "CRM export analysis", "adjacent", "profile", ["CRM エクスポートと利用状況 CSV"], "accepted adjacent data literacy support", 0.62),
    skillMatch("skill-sql", "SQL", variant === "high-match" ? "adjacent" : "missing", "requirement", [], "basic SQL evidence is limited", 0.5),
    skillMatch("skill-feedback", "feedback loop design", variant === "high-match" ? "matched" : "adjacent", "requirement", ["顧客要望の共有"], "customer success evidence is adjacent")
  ];

  if (variant === "low-match") {
    return base.map((match) =>
      match.skillMatchKey === "skill-feedback"
        ? { ...match, relationship: "missing", evidenceReferences: [] }
        : match
    );
  }

  return base;
}

function createPlanWeeks(evidenceGaps: EvidenceGap[], strongPlan: boolean): PlanWeek[] {
  const objectives = [
    "現状経験と求人要件を分解する",
    "問い合わせデータの分類軸を決める",
    "小さな分析メモを作る",
    "フィードバックループを図解する",
    "SQL または BI の基礎分析を練習する",
    "改善効果を定量化する",
    "Product Ops 向けのケースメモを作る",
    "関係者説明のストーリーを整える",
    "面接回答の弱い証拠を補う",
    "証拠素材を公開可能な形に整える",
    "模擬面接で回答を圧縮する",
    "応募・面接用の証拠セットを仕上げる"
  ];

  return objectives.map((objective, index) => {
    const weekNumber = index + 1;
    const gap = evidenceGaps[index % evidenceGaps.length];

    return {
      weekKey: `week-${weekNumber}`,
      weekNumber,
      objective,
      reviewPrompt: `${weekNumber}週目で作った証拠は、求人要件のどこに効くかを一文で説明してください。`,
      status: weekNumber === 1 ? "in_progress" : "not_started",
      tasks: [
        {
          taskKey: `task-${weekNumber}-1`,
          title:
            weekNumber === 1
              ? "職務経歴と求人要件の差分を3つに絞る"
              : `${objective}ための作業を1つ完了する`,
          evidenceToCreate: strongPlan
            ? gap.evidenceToCreate
            : "学習メモと次に確認する項目を整理する。",
          linkedRequirementKey: gap.linkedRequirementKey,
          linkedEvidenceGapKey: strongPlan || weekNumber <= 4 ? gap.gapKey : null,
          status: weekNumber === 1 ? "in_progress" : "not_started"
        }
      ]
    };
  });
}

function createEvidenceArtifacts(evidenceGaps: EvidenceGap[]): EvidenceArtifact[] {
  return evidenceGaps.map((gap, index) => ({
    artifactKey: `artifact-${index + 1}`,
    proofType:
      index === 0
        ? "measurable_result"
        : index === 1
          ? "process_document"
          : index === 2
            ? "technical_note"
            : "case_study",
    title: gap.title,
    sourceRequirementKey: gap.linkedRequirementKey,
    sourceEvidenceGapKey: gap.gapKey,
    whyItMatters: gap.whyItMatters,
    evidenceToCreate: gap.evidenceToCreate,
    nextAction: index === 0 ? "問い合わせサンプルを20件に絞る" : "1枚の構成メモを書く",
    source: "analysis",
    targetWeek: index + 2,
    status: "not_started"
  }));
}

function requirement(
  requirementKey: string,
  normalizedText: string,
  type: JobRequirement["type"],
  category: JobRequirement["category"],
  priority: number,
  weight: number,
  requiredSkills: string[]
): JobRequirement {
  return {
    requirementKey,
    normalizedText,
    type,
    category,
    priority,
    weight,
    sourceReference: "job-posting:requirements",
    requiredSkills
  };
}

function coverage(
  requirementKey: string,
  status: RequirementCoverage["status"],
  evidenceStrength: RequirementCoverage["evidenceStrength"],
  evidenceFromProfile: string[],
  gapNote: string,
  acceptedAdjacentSkills: string[]
): RequirementCoverage {
  const requirement = createRequirements().find((item) => item.requirementKey === requirementKey);
  if (!requirement) {
    throw new Error(`Unknown requirement key: ${requirementKey}`);
  }

  return {
    requirementKey,
    requirement: requirement.normalizedText,
    type: requirement.type,
    status,
    weight: requirement.weight,
    evidenceStrength,
    evidenceFromProfile,
    gapNote,
    acceptedAdjacentSkills
  };
}

function finding(group: KeyFinding["group"], title: string, detail: string): KeyFinding {
  return { group, title, detail };
}

function skillMatch(
  skillMatchKey: string,
  canonicalSkill: string | null,
  relationship: SkillMatch["relationship"],
  source: SkillMatch["source"],
  evidenceReferences: string[],
  basis: string,
  adjacencyScore?: number
): SkillMatch {
  return {
    skillMatchKey,
    canonicalSkill,
    relationship,
    source,
    evidenceReferences,
    basis,
    adjacencyScore
  };
}

