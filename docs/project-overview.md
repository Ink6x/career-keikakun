# キャリアけいかくん Requirements And Context

Status: background context only. For current implementation decisions, use
`docs/README.md`, `docs/agent-development-guide.md`, and the canonical design
documents listed there.

この文書は、新しい Codex セッションや別ディレクトリで作業を始めても、これまでの議論と設計意図を失わないための引き継ぎ資料です。

目的は、Ink6x の GitHub ポートフォリオを補強するために、採用担当者にも伝わりやすく、かつ技術面接で深掘りできる Demo app の要件を整理することです。

## 0. 現時点の確定事項

2026-05-15 時点で、実装範囲は小さな第一段階に切りません。

初回実装から、以下を含む「全機能デモ」として作ります。

- Analyze
- Plan
- Review
- Interview Studio
- Evidence Builder
- Process Trace
- README
- architecture notes
- tests
- CI

ただし、これは公開ポートフォリオ用の Demo app です。課金、実求人 API、メール送信、Slack / Notion 連携、本格的な SaaS 運用機能は含めません。

ユーザー管理は匿名セッション方式にします。アカウント登録は不要にし、ブラウザ単位の visitor / session に分析履歴を紐づけます。

AI provider は real 優先です。OpenAI または Anthropic の環境変数が設定されている場合は real provider を使い、未設定・失敗・schema validation 失敗時は deterministic mock に fallback します。API key がなくても全導線を触れることは必須です。

raw storage は初回実装に含めます。ただしデフォルトは保存しません。ユーザーが明示的に同意した入力だけ、共通 `RawPayload` の暗号化済み payload として保存します。

## 1. 背景

対象 GitHub は `https://github.com/Ink6x` です。

公開リポジトリには以下がありました。

| Repository | 位置づけ | 見えたこと |
| --- | --- | --- |
| `Portfolio-site` | ポートフォリオサイト | Next.js / TypeScript の構成はあるが、README は初期テンプレのまま。TODO や未実装 API スタブが残っている |
| `history-soul-matcher` | toC 向け AI 診断アプリ | Claude Vision、画像アップロード、スコアリング、Zod 検証などの実装がある。README、CI、テスト、プライバシー説明が弱い |
| `coaching-ai-workflow` | 受託案件のケーススタディ | コーチング事業向け AI 実行基盤の設計文書。承認フロー、レポート生成、RAG、監査、運用設計の説明があるが、実コードは非公開 |
| `ai-workflow-automation` | 受託案件のケーススタディ | 採用オペレーション向け AI 実行基盤の設計文書。Policy Gate、Command Registry、Job Queue、Sandbox Worker、Audit の説明があるが、実コードは非公開 |

初期評価では、設計文書から AI 業務改善の理解は見える一方で、採用担当者や発注者からは「動く証拠」「コードでの証明」「完成度」が不足して見える、という課題がありました。

特に、受託案件 2 件は実クライアントや本番コードを公開しにくいため、そのままでは実装力の証明として弱くなります。

## 2. ここまでの議論の流れ

最初は、受託案件 2 件の設計力をコードで示すために、`AI Workflow Control Plane Demo` のような reference implementation を作る案が出ました。

この案では、Slack / Discord 風の入力、AI 計画生成、Policy Gate、dry-run、承認、Job Queue、Audit Log、mock LINE / mock Notion などを作り、`coaching-ai-workflow` と `ai-workflow-automation` の設計を再現する方向でした。

しかし、この方向は技術者には伝わりやすい一方、採用担当者や非エンジニアには「結局何ができるアプリなのか」が伝わりにくいという懸念がありました。

そこで、Demo app は「表側は直感的に理解できる toC / prosumer 体験」にし、その裏側に AI 実行基盤、状態管理、RAG、監査ログ、承認フローを仕込む方針に変えました。

一度は中高生向けの学習・コーチング伴走アプリ案が出ましたが、採用担当者にとっては利用シーンが少し遠い可能性があるため、社会人向けに絞り直しました。

最終的に、ターゲットを「キャリア相談とキャリアアップに向けた伴走」に寄せる方針になりました。

## 3. 現時点の結論

作るべき Demo app は、単なる AI チャットや架空 SaaS ではなく、社会人が自分の職務経験と目標職種を整理し、90 日でキャリアアップに向けた証拠を作るための AI キャリア伴走アプリです。

仮称は `キャリアけいかくん` です。

一言で説明すると、次のようなアプリです。

> 職務経歴・目標職種・求人票を読み込み、スキルギャップを可視化し、90 日間のキャリアアップ計画と週次レビューを自動で伴走する AI キャリアコーチ。

このテーマは、採用担当者にも直感的に理解しやすく、社会人ユーザーの課題も明確です。

同時に、裏側では次の技術を自然に示せます。

- LLM structured output
- schema validation
- RAG / embeddings for retrieval and adjacent-skill classification
- スキル分類と正規化
- 求人票とのマッチングスコア
- 90 日計画生成
- 週次レビューの状態管理
- 長期的なユーザーメモリ
- 面接回答の添削
- 証拠素材の整理
- async job / audit log
- プライバシーを意識したデータ設計

## 4. ターゲットユーザー

最初のターゲットは、次のように限定します。

### Primary User

20 代後半から 30 代前半の社会人。

現在の職務経験を棚卸しし、次の職種、社内異動、転職、またはキャリアアップに向けて 90 日間で準備したい人。

### 想定ユーザー例

- 現職で成果は出しているが、職務経歴書や面接でうまく言語化できない人
- 次の職種に行きたいが、求人票と自分の経験の差分がわからない人
- AI 活用 PM、Web エンジニア、BizOps、CS Ops、データアナリストなどにキャリアを寄せたい人
- 副業や転職活動に向けて、ポートフォリオや実績の見せ方を整理したい人

### このユーザーが困っていること

- 自分の経験がどの職種に通用するのかわからない
- 求人票を読んでも、何を準備すればよいかわからない
- 職務経歴書が業務一覧になり、成果や強みとして伝わらない
- 学習計画が抽象的で続かない
- 面接で話すエピソードを構造化できない
- 週ごとの行動に落とし込めず、準備が進まない

## 5. 採用担当者に伝える価値

この Demo app は、採用担当者に対して以下を伝えるためのものです。

1. ユーザー課題を要件に落とせる
2. AI 機能を「便利なチャット」ではなく、業務フローや行動計画に接続できる
3. LLM 出力を構造化し、検証し、UI とデータモデルに落とせる
4. 単発回答ではなく、継続的な伴走体験を設計できる
5. 状態管理、スコアリング、レポート生成、レビュー履歴を扱える
6. 受託案件で語っている「AI 実行基盤」「承認」「監査」「RAG」を、公開できる合成データのプロダクトとして再現できる

採用担当者向けには、最初の 5 秒で「キャリアアップのための AI コーチアプリ」とわかることが重要です。

技術面接官向けには、README、architecture document、コード、テスト、CI で実装の深さを見せます。

## 6. Product Concept

### Product Name

`キャリアけいかくん`

### Tagline

次のキャリアに向けて、経験を棚卸しし、スキルギャップを埋める 90 日間の AI キャリア伴走アプリ。

### Core Promise

ユーザーが職務経歴と目標職種、求人票を入力すると、AI が現在地を整理し、足りない証拠を可視化し、90 日間の行動計画と週次レビューでキャリアアップを伴走します。

### Product Positioning

単なる AI キャリア相談チャットではありません。

求人票、職務経歴、目標職種、週次の行動ログをもとに、次のキャリアに必要な「証拠」を作るためのアプリです。

## 7. 全体実装要件

初回実装では、範囲を削らずに次の 7 画面を作ります。

### 1. Onboarding

ユーザーが現在の職種、経験年数、目標職種、転職または社内異動の希望時期を入力します。

入力例:

- 現在の職種
- 経験年数
- 目標職種
- 目標時期
- 興味のある業界
- 苦手意識のある領域

### 2. Profile Analyzer

職務経歴書、自己紹介、または LinkedIn 風プロフィールを貼り付けると、AI が経験を構造化します。

抽出する項目:

- 職務経験
- 実績
- 使用スキル
- 業務ドメイン
- 意思決定経験
- 改善経験
- リーダーシップ経験
- 面接で使えそうなエピソード

技術的には、LLM の structured output と Zod などの schema validation を使います。

### 3. Job Match

ユーザーが求人票を貼り付けると、現在の経験とのマッチ度を出します。

表示するもの:

- 総合マッチ率
- 強みとして使える経験
- 不足しているスキル
- 証明が足りない項目
- 90 日以内に作れる成果物候補

ここでは単に AI に感想を書かせるのではなく、求人票から requirements を抽出し、ユーザープロフィールと比較し、スコアリングします。

### 4. 90-Day Plan

目標職種に向けて、12 週間の行動計画を生成します。

計画は以下の単位で構造化します。

- Week
- Objective
- Tasks
- Evidence to create
- Reflection prompt
- Suggested evidence material

例:

- Week 1: 職務経歴の棚卸し
- Week 2: 求人票 3 件の共通要件を分析
- Week 3: 不足スキルを補う小さな成果物を作る
- Week 4: 職務経歴書を改善
- Week 5-8: 実績化できるミニプロジェクトを進める
- Week 9-10: 面接回答を作る
- Week 11-12: 応募資料を仕上げる

### 5. Weekly Review

ユーザーが毎週の進捗を入力します。

入力例:

- 今週やったこと
- 詰まったこと
- 気づいたこと
- 作った成果物
- 来週やるべきこと

AI は、進捗を整理し、次週の行動を更新します。

ここは既存の `coaching-ai-workflow` における Daily / Weekly の再現ポイントです。

### 6. Interview Studio

目標職種と求人票に合わせて、想定質問を生成し、ユーザーの回答を添削します。

機能:

- 初期 6 問の想定質問生成
- behavioral 2 問、role skill 2 問、gap 1 問、portfolio/evidence 1 問
- STAR 形式での回答整理
- 回答の弱点指摘
- 具体性、成果、再現性の評価
- 改善案の提示

### 7. Evidence Builder

ユーザーの経験、求人要件、週次レビュー、面接練習をもとに、次のキャリア準備で作るべき「証拠素材」を整理します。

Evidence Builder は文章生成ツールではありません。職務経歴書 bullet、README section、面接エピソードなどの文章は初回設計では生成しません。

表示するもの:

- 証拠素材のタイトル
- 対応する求人要件または evidence gap
- なぜ必要か
- 作るべき証拠
- 次のアクション
- 目標週
- 状態: not started / in progress / ready / archived

## 8. 技術要件

### 推奨スタック

- Next.js
- TypeScript
- React
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- LLM API
- Embeddings / vector search
- GitHub Actions
- Vitest
- Playwright

API 実装は hybrid 方針にします。永続化、provider call、分析 pipeline、レビュー送信、面接回答評価、証拠素材更新、Process Trace は Route Handlers が担当します。Server Actions はフォーム送信 wrapper、redirect、URL 更新など UI adapter に限定します。

### Demo として必須の技術証拠

| 技術要素 | 採用担当者に伝わる価値 | エンジニアに伝わる価値 |
| --- | --- | --- |
| structured output | AI が実用的な形で結果を返す | schema validation と失敗時処理が見える |
| scoring engine | マッチ度が直感的に伝わる | LLM 任せではない deterministic logic が見える |
| skill taxonomy | キャリア分析に説得力が出る | 正規化、分類、比較ロジックが見える |
| 90-day planner | プロダクト価値が伝わる | 状態遷移と計画更新の設計が見える |
| weekly review | 継続利用の体験が出る | longitudinal memory と履歴管理が見える |
| audit log | 信頼性のある AI 機能に見える | 重要な AI 出力や状態変更を追跡できる |
| mock fallback | 誰でも試せる | API key なしで CI / demo が安定する |
| tests | 実装品質が伝わる | スコアリング、schema、state transition を検証できる |

## 9. データモデル案

現在の中心単位は `AnalysisSession` です。1 回の分析実行ごとに session を作り、解析結果、計画、レビュー、面接練習、証拠生成、Process Trace、audit trail を紐づけます。

匿名セッション方式のため、必須のアカウント登録は置きません。将来の認証連携に備えて external auth subject を nullable で持てる余地だけ残します。

raw text はデフォルト保存しません。職務経歴、求人票、レビュー回答、面接回答は、hash・summary・構造化済みデータを保存し、明示同意がある場合だけ共通 `RawPayload` に encrypted payload として保存します。この consent-based encrypted raw storage は初回実装範囲に含めます。

主要モデルは以下です。

```text
AnonymousVisitor
- id
- locale
- rawStoragePolicy
- externalAuthSubject
- firstSeenAt
- lastSeenAt

UserProfile
- id
- anonymousVisitorId
- currentRole
- targetRole
- yearsOfExperience
- targetTimeline
- rawStoragePolicy
- createdAt

AnalysisSession
- id
- anonymousVisitorId
- userProfileId
- status
- source
- providerMode
- embeddingMode
- extractedTargetRoleTitle
- idempotencyKey
- schemaVersion
- startedAt
- completedAt

`AnalysisSession.status` は初回分析 pipeline の状態だけを表します。Weekly Review、Interview Studio、Evidence Builder の進捗は child record と audit event から派生させ、session status には混ぜません。

`JobPosting.roleTitle`、`AnalysisSession.extractedTargetRoleTitle`、`CareerPlan.targetRole` は DB 上では分けて保持します。通常 UI では 1 つの target role label として表示し、Process Trace で必要に応じて由来を確認できるようにします。

Provider output の汎用 `confidence` は採用しません。confidence 的な数値は adjacent skill candidate の `adjacencyScore` / `similarityScore` のような補助診断に限定し、final score には直接入れません。

InputDocument
- id
- analysisSessionId
- kind
- sha256Hash
- language
- tokenCount
- summary
- consentReference
- createdAt

RawPayload
- id
- analysisSessionId
- kind
- inputDocumentId
- reviewMessageId
- interviewAnswerId
- encryptedPayloadCiphertext
- encryptedPayloadNonce
- encryptedPayloadAuthTag
- encryptionKeyVersion
- consentReference
- status
- createdAt
- clearedAt

CareerProfile
- id
- analysisSessionId
- structuredExperienceJson
- extractedSkillsJson
- achievementsJson
- interviewExamplesJson
- summary
- schemaVersion
- createdAt

JobPosting
- id
- analysisSessionId
- roleTitle
- summary
- createdAt

JobRequirement
- id
- jobPostingId
- normalizedText
- type
- category
- weight
- priority
- sourceReference
- createdAt

MatchAnalysis
- id
- analysisSessionId
- jobPostingId
- matchScore
- scoringBreakdownJson
- explanationSnapshotJson
- createdAt

RequirementCoverage
- id
- matchAnalysisId
- jobRequirementId
- status
- evidenceFromProfile
- gapNote
- createdAt

EvidenceGap
- id
- analysisSessionId
- linkedRequirementId
- title
- whyItMatters
- evidenceToCreate
- difficulty
- expectedImpact
- createdAt

CareerPlan
- id
- analysisSessionId
- targetRole
- currentWeek
- status
- createdAt

PlanWeek
- id
- careerPlanId
- weekNumber
- objective
- reviewPrompt
- status
- createdAt

PlanTask
- id
- planWeekId
- title
- evidenceToCreate
- linkedRequirementId
- linkedEvidenceGapId
- status
- createdAt

WeeklyReview
- id
- analysisSessionId
- careerPlanId
- weekNumber
- summaryJson
- nextActionsJson
- createdAt

ReviewMessage
- id
- analysisSessionId
- weeklyReviewId
- role
- messageHash
- messageSummary
- metadataJson
- createdAt

InterviewQuestion
- id
- analysisSessionId
- question
- category
- linkedRequirementId
- linkedEvidenceGapId
- createdAt

InterviewAnswer
- id
- interviewQuestionId
- answerHash
- answerSummary
- createdAt

InterviewEvaluation
- id
- interviewAnswerId
- evaluationJson
- improvedAnswer
- createdAt

EvidenceArtifact
- id
- analysisSessionId
- proofType
- title
- sourceRequirementId
- sourceEvidenceGapId
- whyItMatters
- evidenceToCreate
- nextAction
- source
- targetWeek
- status
- createdAt

PipelineRun
- id
- analysisSessionId
- providerMode
- embeddingMode
- status
- startedAt
- completedAt

PipelineStep
- id
- pipelineRunId
- stepName
- status
- validationStatus
- startedAt
- completedAt

AuditEvent
- id
- analysisSessionId
- eventType
- entityType
- entityId
- metadataJson
- createdAt
```

## 10. AI 設計方針

AI は自由に何でも決める存在ではなく、各機能の中で明確な責務を持たせます。

Embedding / similarity は、スコアに直接足し込むのではなく、近接スキル候補を分類する補助として使います。最終的なマッチスコアは、要件カバー率、証拠の強さ、正規化済みスキルの対応関係にもとづく deterministic logic で計算します。

### LLM の役割

- 職務経歴の構造化
- 求人票の要件抽出
- 経験と要件の説明文生成
- 90 日計画の初期案作成
- 週次レビューの要約
- 面接回答のフィードバック

### deterministic logic の役割

- スキルマッチのスコアリング
- 必須要件と歓迎要件の重みづけ
- 週次進捗の状態更新
- 入力の validation
- 出力 schema の検証
- audit event の記録

この分離により、「AI に丸投げしているアプリ」ではなく、「AI をプロダクトの一部として制御しているアプリ」に見せられます。

## 11. UI / UX 方針

採用担当者に伝わりやすいことを優先します。

### 第一画面で伝えること

- これはキャリアアップ伴走アプリである
- 職務経歴と求人票から、次のキャリアに必要な準備を可視化する
- 90 日計画と週次レビューで行動に落とす

### トーン

過度にポップにしすぎず、社会人が使うプロダクトとして落ち着いた UI にします。

toC らしく触って楽しい体験は必要ですが、キャリアや転職を扱うため、信頼感を優先します。

AI coach の人格は、キャリア準備を見てくれる塾の先生に近づけます。基本的には寄り添いますが、評価は客観的に行い、証拠が弱い点、回答が抽象的な点、求人要件とつながっていない点ははっきり指摘します。ただし人格を否定せず、必ず次の具体アクションにつなげます。

### 見せ場

- 求人票貼り付け後に、マッチ度とギャップが一気に表示される
- 90 日計画が週単位で整理される
- Weekly Review により、計画が更新される
- Interview Studio で回答が改善される
- Evidence Builder で作るべき証拠素材が整理される

## 12. 非目標

初回実装でも以下はやりません。

- 実際の転職サイト連携
- 実求人 API 連携
- 課金
- 本格的な認証
- 複数ユーザー組織管理
- 実メール送信
- 実 Slack / Notion 連携
- 本物の個人情報を前提にした運用
- 医療、法律、金融のような高リスク助言

Demo app として、real provider 優先で動かしつつ、合成データと deterministic mock fallback だけでも全導線が成立することを必須にします。

## 13. ポートフォリオ上の見せ方

この Demo app は、単体リポジトリとして公開します。

README には以下を必ず入れます。

- 何のアプリか
- 誰の課題を解くか
- Demo URL
- スクリーンショット
- 主要機能
- アーキテクチャ図
- データフロー
- AI の使い方
- LLM と deterministic logic の分離
- setup 手順
- real provider と mock fallback の説明
- test / lint / build の実行方法
- 実装上の tradeoff
- 今後の改善

`Portfolio-site` からは、代表作としてこの Demo app を前面に出します。

受託案件 2 件は、この Demo app と接続して見せます。

例:

> 受託案件では実コードを公開できないため、公開可能な合成データで AI 伴走ワークフロー、週次レビュー、レポート生成、監査ログのパターンを再構成した Demo app を作成しました。

## 14. 受託案件との接続

### `coaching-ai-workflow` との接続

再現できる要素:

- Daily / Weekly の伴走体験
- 週次レビュー
- レポート生成
- 長期履歴を使ったフィードバック
- ダッシュボードでの進捗可視化
- AI 出力を人間が確認する前提の設計

ただし、実クライアントのデータ、実 UI、実レポート、実メトリクスは使わず、合成データに置き換えます。

### `ai-workflow-automation` との接続

再現できる要素:

- AI の出力を schema で制御する
- 重要な状態変更を audit log に残す
- AI に最終判断を丸投げしない
- deterministic scoring と LLM 生成を分離する
- mock connector / mock job で外部副作用を再現する

初回実装では本格的な Policy Gate や Job Queue を前面に出しすぎない方針です。採用担当者には伝わりにくいため、必要な部分だけ裏側の設計として実装します。

## 15. 実装整理案

以下はリリース範囲の段階分けではなく、実装時の作業順を整理するための単位です。公開デモとしては、Phase 1 から Phase 5 までをまとめて完成対象にします。

### Phase 1: Product Skeleton

- Next.js app 作成
- 基本 UI
- seed data
- mock fallback
- Dashboard
- Onboarding
- Profile Analyzer の静的 UI

### Phase 2: Core Intelligence

- 職務経歴の structured extraction
- 求人票の requirements extraction
- skill taxonomy
- match scoring
- Zod validation
- fallback handling

### Phase 3: Career Plan

- 90-day plan generator
- weekly review
- plan update
- progress dashboard
- audit event

### Phase 4: Interview And Evidence

- Interview Studio
- Answer evaluation
- Evidence Builder
- evidence board / status tracking

### Phase 5: Portfolio Hardening

- README
- architecture.md
- screenshots
- demo video or GIF
- CI
- unit tests
- E2E smoke test
- deployment

## 16. 最低限の完成条件

公開前に満たすべき条件です。

- Demo URL が動く
- API key なしでも mock fallback で全導線を触れる
- README が初期テンプレではない
- スクリーンショットがある
- `npm run lint` または同等の check が通る
- `npm run test` が通る
- `npm run build` が通る
- スコアリングロジックに unit test がある
- structured output の schema validation がある
- 主要な状態変更が audit log に残る
- 同意時のみ encrypted raw storage が動く
- 同意がない場合は raw text が保存されない
- Interview Studio の回答評価が動く
- Evidence Builder の証拠素材ボードと状態更新が動く
- 合成データだけで動く
- 個人情報や実クライアント情報を含まない

## 17. 注意点

このアプリは、キャリア助言を扱いますが、職業紹介、採用保証、法的助言、収入保証をするものではありません。

画面や README では、以下のような表現を避けます。

- 転職成功を保証
- 年収アップを保証
- 採用される回答を作る
- 完璧なキャリア診断

代わりに、以下のように表現します。

- 職務経験を整理する
- 求人票とのギャップを可視化する
- 次に作るべき証拠を提案する
- 面接回答を改善する
- 90 日間の準備を支援する

## 18. 新しいセッションでの開始指示

別ディレクトリや新しい Codex セッションで作業を始める場合は、この文書を読ませた上で、次のように依頼するとよいです。

```text
この `career-keikakun-demo-requirements.md` を前提に、キャリアけいかくん の Demo app を新規作成したい。
まずは全機能デモの実装計画を作り、既存のポートフォリオ目的に合うように、機能範囲、データモデル、画面構成、README 構成を具体化して。
採用担当者に伝わりやすい体験を優先しつつ、技術面接で深掘りできる実装証拠も残したい。
```

実装まで進める場合は、次のように依頼できます。

```text
この要件に沿って、Next.js / TypeScript で `career-keikakun` の新規アプリを作成して。
real provider 優先、mock fallback 前提で、Onboarding、Profile Analyzer、Job Match、90-Day Plan、Weekly Review、Interview Studio、Evidence Builder、Process Trace の主要導線を実装して。
README、architecture notes、seed data、schema validation、scoring の unit test、E2E smoke test、CI まで含めて。
```

## 19. 現時点の判断

大規模 Demo app を作る方向性は妥当です。

ただし、単に機能数の多いアプリにするのではなく、社会人向けキャリア伴走というわかりやすいテーマに絞り、裏側で AI 実行設計の深さを示すのが重要です。

`キャリアけいかくん` は、`history-soul-matcher` のような直感的なわかりやすさと、受託案件 2 件で示した AI 業務設計の深さを接続するための公開 Demo app として位置づけます。
