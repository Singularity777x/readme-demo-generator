import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  BadgeCheck,
  BookOpen,
  Braces,
  Check,
  Clipboard,
  Code2,
  Download,
  FileImage,
  FileText,
  Github,
  Globe2,
  ImagePlus,
  Laptop,
  Link,
  ListChecks,
  MonitorPlay,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Upload,
} from "lucide-react";
import "./styles.css";

type License = "MIT" | "Apache-2.0" | "GPL-3.0" | "BSD-3-Clause";
type PreviewMode = "rendered" | "markdown";

type ProjectState = {
  name: string;
  tagline: string;
  description: string;
  installCommand: string;
  usageCommand: string;
  cliOutput: string;
  appUrl: string;
  license: License;
  includeBadges: boolean;
  includeGifSlot: boolean;
  includeContributing: boolean;
};

type Screenshot = {
  name: string;
  url: string;
};

type ReadmeCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

const initialState: ProjectState = {
  name: "README Demo Generator",
  tagline: "Turn screenshots, CLI output, and local app URLs into polished GitHub READMEs.",
  description:
    "A focused README authoring tool for open-source maintainers who want strong install docs, usage examples, badges, and demo media without starting from a blank markdown file.",
  installCommand: "npm install && npm run dev",
  usageCommand: "npm run build",
  cliOutput:
    "$ npm run build\n\nvite v6.0.7 building for production...\n✓ 37 modules transformed.\ndist/index.html  0.46 kB\ndist/assets/index.css  18.2 kB\ndist/assets/index.js  201.4 kB\n✓ built in 1.2s",
  appUrl: "http://localhost:5173",
  license: "MIT",
  includeBadges: true,
  includeGifSlot: true,
  includeContributing: true,
};

const badgeOptions = [
  { label: "build", value: "passing", color: "success" },
  { label: "license", value: "MIT", color: "info" },
  { label: "open source", value: "yes", color: "dark" },
];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generateMarkdown(project: ProjectState, screenshots: Screenshot[]) {
  const slug = slugify(project.name) || "project";
  const badges = project.includeBadges
    ? [
        `![Build](https://img.shields.io/badge/build-passing-brightgreen)`,
        `![License](https://img.shields.io/badge/license-${project.license.replace("-", "--")}-blue)`,
        `![Open Source](https://img.shields.io/badge/open%20source-yes-111827)`,
      ].join("\n")
    : "";
  const media = screenshots.length
    ? screenshots.map((shot) => `![${shot.name}](docs/${shot.name})`).join("\n\n")
    : project.includeGifSlot
      ? `![${project.name} demo](docs/demo.gif)\n\n![Screenshot](docs/screenshot.png)`
      : `![Screenshot](docs/screenshot.png)`;

  return `# ${project.name}

${badges ? `${badges}\n` : ""}
${project.tagline}

## Overview

${project.description}

## Demo

${media}

${project.appUrl ? `Local preview: [${project.appUrl}](${project.appUrl})\n` : ""}
## Installation

\`\`\`bash
${project.installCommand}
\`\`\`

## Usage

\`\`\`bash
${project.usageCommand}
\`\`\`

## CLI Output

\`\`\`text
${project.cliOutput}
\`\`\`

## Project Structure

\`\`\`text
${slug}/
├── src/
├── docs/
│   ├── demo.gif
│   └── screenshot.png
└── README.md
\`\`\`

${project.includeContributing ? `## Contributing

Issues and pull requests are welcome. Please open a focused issue before large changes so the project can stay small, clear, and useful.

` : ""}## License

${project.license}
`;
}

function getReadmeChecks(project: ProjectState, screenshots: Screenshot[]): ReadmeCheck[] {
  return [
    {
      label: "Clear project title",
      passed: project.name.trim().length >= 3,
      detail: "Use the repository or package name as the first heading.",
    },
    {
      label: "Short value proposition",
      passed: project.tagline.trim().length >= 18,
      detail: "Add one sentence that says what the project does.",
    },
    {
      label: "Install command",
      passed: project.installCommand.trim().length > 0,
      detail: "Include the command a new user runs first.",
    },
    {
      label: "Usage command",
      passed: project.usageCommand.trim().length > 0,
      detail: "Show the fastest way to verify the project works.",
    },
    {
      label: "Demo media slot",
      passed: screenshots.length > 0 || project.includeGifSlot,
      detail: "Reserve a GIF or screenshot path for visual proof.",
    },
    {
      label: "CLI proof",
      passed: project.cliOutput.trim().length >= 24,
      detail: "Paste representative output so users know what success looks like.",
    },
    {
      label: "Open-source finish",
      passed: project.includeBadges && project.includeContributing && Boolean(project.license),
      detail: "Badges, contributing notes, and a license make the README release-ready.",
    },
  ];
}

function Field({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      className={`toggle ${checked ? "toggleActive" : ""}`}
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="toggleDot">{checked && <Check size={12} />}</span>
      {label}
    </button>
  );
}

function App() {
  const [project, setProject] = useState<ProjectState>(initialState);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("rendered");
  const markdown = useMemo(() => generateMarkdown(project, screenshots), [project, screenshots]);
  const readmeChecks = useMemo(() => getReadmeChecks(project, screenshots), [project, screenshots]);
  const passedChecks = readmeChecks.filter((check) => check.passed).length;
  const readmeScore = Math.round((passedChecks / readmeChecks.length) * 100);

  function update<K extends keyof ProjectState>(key: K, value: ProjectState[K]) {
    setProject((current) => ({ ...current, [key]: value }));
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setScreenshots((current) => [...next, ...current].slice(0, 4));
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "README.md";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brand">
          <span className="brandMark">
            <BookOpen size={20} />
          </span>
          <span>README Demo Generator</span>
        </div>
        <nav className="topActions" aria-label="Primary actions">
          <a className="iconButton" href="https://github.com" aria-label="Open GitHub">
            <Github size={19} />
          </a>
          <button className="secondaryButton" type="button" onClick={downloadMarkdown}>
            <Download size={17} />
            Export
          </button>
          <button className="primaryButton" type="button" onClick={copyMarkdown}>
            {copied ? <Check size={18} /> : <Sparkles size={18} />}
            {copied ? "Copied" : "Generate README"}
          </button>
        </nav>
      </header>

      <section className="workspace" aria-label="README generator workspace">
        <aside className="panel projectPanel">
          <div className="panelHeader">
            <PackageCheck size={20} />
            <div>
              <h2>Project</h2>
              <p>Open-source metadata and setup commands.</p>
            </div>
          </div>

          <Field label="Repository name" icon={<Github size={15} />}>
            <input value={project.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="Tagline" icon={<Rocket size={15} />}>
            <input value={project.tagline} onChange={(event) => update("tagline", event.target.value)} />
          </Field>
          <Field label="Description" icon={<Braces size={15} />}>
            <textarea
              rows={4}
              value={project.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </Field>
          <Field label="Install command" icon={<TerminalSquare size={15} />}>
            <input
              value={project.installCommand}
              onChange={(event) => update("installCommand", event.target.value)}
            />
          </Field>
          <Field label="Usage command" icon={<Code2 size={15} />}>
            <input value={project.usageCommand} onChange={(event) => update("usageCommand", event.target.value)} />
          </Field>
          <Field label="License" icon={<ShieldCheck size={15} />}>
            <select value={project.license} onChange={(event) => update("license", event.target.value as License)}>
              <option>MIT</option>
              <option>Apache-2.0</option>
              <option>GPL-3.0</option>
              <option>BSD-3-Clause</option>
            </select>
          </Field>

          <div className="toggleGrid">
            <Toggle checked={project.includeBadges} onChange={(checked) => update("includeBadges", checked)} label="Badges" />
            <Toggle checked={project.includeGifSlot} onChange={(checked) => update("includeGifSlot", checked)} label="GIF slot" />
            <Toggle
              checked={project.includeContributing}
              onChange={(checked) => update("includeContributing", checked)}
              label="Contributing"
            />
          </div>
        </aside>

        <section className="panel evidencePanel">
          <div className="panelHeader">
            <MonitorPlay size={20} />
            <div>
              <h2>Demo Inputs</h2>
              <p>Drop screenshots, paste terminal output, or point at a local app.</p>
            </div>
          </div>

          <label className="dropZone">
            <input type="file" accept="image/*" multiple onChange={(event) => handleFiles(event.target.files)} />
            <span className="dropIcon">
              <Upload size={24} />
            </span>
            <strong>Drop screenshots or GIF frames</strong>
            <small>PNG, JPG, or GIF assets become README image slots.</small>
          </label>

          <div className="mediaGrid">
            {screenshots.length ? (
              screenshots.map((shot) => (
                <figure key={shot.url}>
                  <img src={shot.url} alt={shot.name} />
                  <figcaption>{shot.name}</figcaption>
                </figure>
              ))
            ) : (
              <>
                <div className="emptyMedia">
                  <FileImage size={22} />
                  docs/demo.gif
                </div>
                <div className="emptyMedia">
                  <ImagePlus size={22} />
                  docs/screenshot.png
                </div>
              </>
            )}
          </div>

          <Field label="Local app URL" icon={<Globe2 size={15} />}>
            <div className="urlRow">
              <input value={project.appUrl} onChange={(event) => update("appUrl", event.target.value)} />
              <button type="button" className="smallButton" onClick={() => update("cliOutput", `${project.cliOutput}\n\n# Preview captured from ${project.appUrl}`)}>
                <Link size={15} />
                Capture
              </button>
            </div>
          </Field>

          <Field label="CLI output" icon={<TerminalSquare size={15} />}>
            <textarea
              className="terminalInput"
              rows={9}
              value={project.cliOutput}
              onChange={(event) => update("cliOutput", event.target.value)}
            />
          </Field>

          <div className="healthPanel" aria-label="README health checks">
            <div className="healthHeader">
              <span className="healthIcon">
                <ListChecks size={18} />
              </span>
              <div>
                <h3>README Health</h3>
                <p>{passedChecks} of {readmeChecks.length} essentials complete</p>
              </div>
              <strong>{readmeScore}%</strong>
            </div>
            <div className="scoreTrack" aria-hidden="true">
              <span style={{ width: `${readmeScore}%` }} />
            </div>
            <ul className="checkList">
              {readmeChecks.map((check) => (
                <li className={check.passed ? "checkPassed" : "checkMissing"} key={check.label}>
                  {check.passed ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>
                    <strong>{check.label}</strong>
                    <small>{check.detail}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="previewColumn">
          <div className="previewToolbar">
            <div>
              <h2>Live README</h2>
              <p>{markdown.split("\n").length} markdown lines ready · {readmeScore}% health</p>
            </div>
            <div className="previewActions">
              <div className="segmentedControl" aria-label="Preview mode">
                <button
                  className={previewMode === "rendered" ? "activeSegment" : ""}
                  type="button"
                  onClick={() => setPreviewMode("rendered")}
                  aria-pressed={previewMode === "rendered"}
                >
                  <BookOpen size={14} />
                  Preview
                </button>
                <button
                  className={previewMode === "markdown" ? "activeSegment" : ""}
                  type="button"
                  onClick={() => setPreviewMode("markdown")}
                  aria-pressed={previewMode === "markdown"}
                >
                  <FileText size={14} />
                  Markdown
                </button>
              </div>
              <button className="secondaryButton compact" type="button" onClick={copyMarkdown}>
                <Clipboard size={16} />
                Copy
              </button>
            </div>
          </div>

          {previewMode === "rendered" ? (
            <article className="readmePreview">
              <h1>{project.name}</h1>
              {project.includeBadges && (
                <div className="badgeRow">
                  {badgeOptions.map((badge) => (
                    <span className={`badge ${badge.color}`} key={badge.label}>
                      <BadgeCheck size={13} />
                      {badge.label}: {badge.value}
                    </span>
                  ))}
                </div>
              )}
              <p className="lead">{project.tagline}</p>
              <h3>Overview</h3>
              <p>{project.description}</p>
              <h3>Demo</h3>
              <div className="previewMedia">
                {screenshots[0] ? <img src={screenshots[0].url} alt={screenshots[0].name} /> : <Laptop size={40} />}
                <span>{screenshots[0]?.name ?? "docs/demo.gif + docs/screenshot.png"}</span>
              </div>
              <h3>Installation</h3>
              <pre>{project.installCommand}</pre>
              <h3>Usage</h3>
              <pre>{project.usageCommand}</pre>
              <h3>CLI Output</h3>
              <pre className="cliBlock">{project.cliOutput}</pre>
            </article>
          ) : (
            <section className="markdownPane" aria-label="Generated markdown">
              <pre>{markdown}</pre>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
