#!/usr/bin/env python3
"""Generate academic-style PDF of the Dispatch litepaper.

Uses pandoc + tectonic (XeTeX) for authentic IEEE/whitepaper formatting.
Two-pass approach: pandoc generates LaTeX, then tectonic compiles to PDF.
"""

import re
import subprocess
import tempfile
from pathlib import Path

DOCS_DIR = Path(__file__).parent
LITEPAPER_MD = DOCS_DIR / "litepaper-full.md"
OUTPUT_PDF = DOCS_DIR / "Dispatch_Litepaper.pdf"


def clean_markdown(md_text: str) -> str:
    """Clean the markdown for academic formatting."""
    # Remove [IMPLEMENTED] / [DESIGNED] / [FUTURE] tags
    md_text = re.sub(r'\s*\[(?:IMPLEMENTED|DESIGNED|FUTURE)\]', '', md_text)

    # Remove the title (we'll set it in YAML frontmatter)
    md_text = re.sub(r'^#\s+.+\n', '', md_text, count=1)

    # Remove version line and its surrounding dashes
    md_text = re.sub(r'\*\*Version[^*]+\*\*\s*\n+---', '', md_text)

    # Remove ASCII art diagrams (box-drawing characters)
    def replace_ascii_diagram(m):
        content = m.group(1)
        if any(c in content for c in '\u250c\u2510\u2514\u2518\u2502\u2500\u251c\u2524\u252c\u2534\u253c'):
            lines = content.strip().split('\n')
            labels = []
            for line in lines:
                text_parts = re.findall(r'[A-Za-z][\w\s/().+]*[A-Za-z)]', line)
                for part in text_parts:
                    part = part.strip()
                    if len(part) > 3 and part not in labels:
                        labels.append(part)
            if labels:
                desc = ", ".join(labels[:8])
                return f'\n*[Figure: {desc}]*\n'
            return '\n*[Figure: System architecture diagram]*\n'
        return m.group(0)

    md_text = re.sub(r'```\n?(.*?)```', replace_ascii_diagram, md_text, flags=re.DOTALL)

    # Remove the wide comparison table (Section 9) — 6 columns can't fit
    # in a two-column PDF layout. The prose comparison remains.
    md_text = re.sub(
        r'\|[^\n]*Dispatch[^\n]*Akash[^\n]*\n\|[-| ]+\n(\|[^\n]+\n)+',
        '*See online version for full comparison table.*\n',
        md_text
    )

    # Remove leading whitespace/dashes
    md_text = md_text.lstrip('\n -')

    return md_text


def fix_longtable_in_latex(latex: str) -> str:
    """Replace longtable environments with tabular for twocolumn compat."""

    # Step 1: Handle the full {\def\LTcaptype{none} ... \end{longtable}\n} blocks
    # These wrap every longtable pandoc generates
    def replace_lt_block(m):
        inner = m.group(1)
        # Process the inner longtable content
        return process_longtable_inner(inner)

    latex = re.sub(
        r'\{\\def\\LTcaptype\{none\}[^\n]*\n(.*?)\\end\{longtable\}\s*\}',
        replace_lt_block,
        latex,
        flags=re.DOTALL
    )

    # Step 2: Handle any remaining bare longtable (shouldn't be any, but just in case)
    latex = re.sub(
        r'\\begin\{longtable\}.*?\\end\{longtable\}',
        lambda m: process_longtable_inner(m.group(0)),
        latex,
        flags=re.DOTALL
    )

    return latex


def process_longtable_inner(inner: str) -> str:
    """Convert a longtable block to a tabular block."""
    # Remove longtable-specific commands
    inner = re.sub(r'\\endhead\s*', '', inner)
    inner = re.sub(r'\\endlastfoot\s*', '', inner)
    inner = re.sub(r'\\endfirsthead\s*', '', inner)
    inner = re.sub(r'\\endfoot\s*', '', inner)

    # Fix \linewidth -> \columnwidth
    inner = inner.replace(r'\linewidth', r'\columnwidth')

    # Strip minipage wrappers from table headers, keep content as bold
    inner = re.sub(r'\\begin\{minipage\}\[b\]\{[^}]*\}\\raggedright\s*', '', inner)
    inner = re.sub(r'\\end\{minipage\}', '', inner)

    # Count columns by looking for max & count across all data rows
    data_lines = [l for l in inner.split('\n') if '&' in l and 'begin{' not in l]
    if data_lines:
        ncols = max(l.count('&') for l in data_lines) + 1
    else:
        ncols = 2

    # Use tabularx so tables fit cleanly in a two-column layout.
    # Y is a ragged-right X column (defined in the LaTeX template).
    if ncols == 5:
        env = "tabularx"
        colspec = r"lrrrY"
    elif ncols == 4:
        env = "tabularx"
        colspec = r"lrrY"
    elif ncols == 3:
        env = "tabularx"
        colspec = r"lrY"
    elif ncols == 2:
        env = "tabularx"
        colspec = r"lY"
    else:
        env = "tabular"
        colspec = "l" * ncols

    # Remove everything from \begin{longtable} up to (but not including) \toprule
    # This handles both simple and complex multiline column specs
    inner = re.sub(
        r'\\begin\{longtable\}.*?(?=\\toprule)',
        '',
        inner,
        flags=re.DOTALL
    )

    # Remove \end{longtable} if still present
    inner = inner.replace(r'\end{longtable}', '')

    if env == "tabularx":
        begin = r"\begin{tabularx}{\columnwidth}{" + colspec + "}"
        end = r"\end{tabularx}"
    else:
        begin = r"\begin{tabular}{" + colspec + "}"
        end = r"\end{tabular}"

    return (
        r"\begin{center}\scriptsize" "\n"
        r"\setlength{\tabcolsep}{3pt}" "\n"
        + begin + "\n"
        + inner.strip() + "\n"
        + end + "\n"
        r"\end{center}"
    )


LATEX_TEMPLATE = r"""
\documentclass[10pt,twocolumn,letterpaper]{article}

% ── Packages ──
\usepackage{fontspec}
\setmainfont{Times New Roman}[
  BoldFont = Times New Roman Bold,
  ItalicFont = Times New Roman Italic,
  BoldItalicFont = Times New Roman Bold Italic
]
\setmonofont{Courier New}[Scale=0.85]

\usepackage[margin=0.85in,top=1in,bottom=1in]{geometry}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{array}
\usepackage{tabularx}
\usepackage{longtable}   % needed for \real{} in column specs
\usepackage{xurl}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{fancyhdr}
\usepackage{titlesec}
% abstract formatting done manually (abstract package conflicts with fontspec)
\usepackage{enumitem}
\usepackage{microtype}
\usepackage{fancyvrb}
\usepackage{fvextra}
\usepackage{float}

% ── Colors ──
\definecolor{linkblue}{RGB}{0,51,153}
\definecolor{codebg}{RGB}{245,245,245}
\definecolor{codeframe}{RGB}{200,200,200}

% ── Hyperref ──
\hypersetup{
    colorlinks=true,
    linkcolor=linkblue,
    urlcolor=linkblue,
    citecolor=linkblue,
    breaklinks=true,
    pdftitle={$title$},
    pdfauthor={$for(author)$$author$$sep$, $endfor$},
}

% Better wrapping for long links/monospace tokens in narrow two-column layout
\Urlmuskip=0mu plus 2mu\relax
\setlength{\emergencystretch}{5em}
\fvset{
  breaklines=true,
  breakanywhere=true,
  fontsize=\footnotesize
}

% Pandoc emits \begin{verbatim} for fenced code blocks. Re-map it to Verbatim
% so long lines wrap in a two-column layout.
\RecustomVerbatimEnvironment{verbatim}{Verbatim}{breaklines=true,breakanywhere=true}

% ── Headers/footers ──
\pagestyle{fancy}
\fancyhf{}
\fancyfoot[C]{\thepage}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% ── Section formatting ──
\titleformat{\section}
    {\normalfont\large\bfseries\MakeUppercase}
    {\thesection.}{0.5em}{}
\titleformat{\subsection}
    {\normalfont\normalsize\bfseries\itshape}
    {\thesubsection}{0.5em}{}
\titleformat{\subsubsection}
    {\normalfont\normalsize\bfseries}
    {\thesubsubsection}{0.5em}{}

\titlespacing*{\section}{0pt}{12pt}{6pt}
\titlespacing*{\subsection}{0pt}{8pt}{4pt}
\titlespacing*{\subsubsection}{0pt}{6pt}{3pt}

% ── Abstract formatting (manual) ──

% ── List formatting ──
\setlist[itemize]{nosep,leftmargin=1.5em}
\setlist[enumerate]{nosep,leftmargin=1.5em}

% ── Table formatting ──
\renewcommand{\arraystretch}{1.3}
\newcolumntype{Y}{>{\raggedright\arraybackslash}X}

% ── Pandoc tightlist ──
\providecommand{\tightlist}{%
  \setlength{\itemsep}{0pt}\setlength{\parskip}{0pt}}

$if(highlighting-macros)$
$highlighting-macros$
$endif$

% ── Begin document ──
\begin{document}
\sloppy
\setlength{\emergencystretch}{3em}

% ── Title block (full-width) ──
\twocolumn[
\begin{@twocolumnfalse}
\begin{center}
    {\LARGE\bfseries $title$ \par}
    \vspace{12pt}
    {\large $for(author)$$author$$sep$ \and $endfor$ \par}
    \vspace{4pt}
    {\normalsize\itshape Dispatch \par}
    \vspace{4pt}
    {\small $date$ \par}
    \vspace{2pt}
    {\small\color{gray} \url{https://www.dispatch.computer} \par}
    \vspace{12pt}
\end{center}

$if(abstract)$
\vspace{4pt}
\begin{center}\textbf{\small ABSTRACT}\end{center}
\vspace{2pt}
\begin{quote}
\small\noindent $abstract$
\end{quote}
$endif$

\vspace{8pt}
\noindent\rule{\textwidth}{0.4pt}
\vspace{4pt}
\end{@twocolumnfalse}
]

$body$

\end{document}
"""


def main():
    md_text = LITEPAPER_MD.read_text()

    # Extract abstract before cleaning
    abstract_match = re.search(
        r'## Abstract\s*\n(.*?)(?=\n---|\n## )',
        md_text, re.DOTALL
    )
    abstract_text = abstract_match.group(1).strip() if abstract_match else ""

    # Clean the markdown
    cleaned = clean_markdown(md_text)

    # Remove the abstract section from body
    cleaned = re.sub(r'## Abstract\s*\n.*?(?=\n---|\n## )', '', cleaned, flags=re.DOTALL)
    cleaned = cleaned.lstrip('\n -')

    # Build the pandoc-ready markdown with YAML frontmatter
    pandoc_md = f"""---
title: "Dispatch: Agent-Native Compute via x402 Payment, ERC-8004 Reputation, and BOLT Token Settlement"
author:
  - Pranit Garg
date: "February 2026"
abstract: |
  {abstract_text}
---

{cleaned}
"""

    # Write template and markdown to temp files
    with tempfile.NamedTemporaryFile(mode='w', suffix='.latex', delete=False) as tf:
        tf.write(LATEX_TEMPLATE)
        template_path = tf.name

    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as mf:
        mf.write(pandoc_md)
        md_path = mf.name

    # Step 1: Generate LaTeX from pandoc
    latex_path = tempfile.mktemp(suffix='.tex')
    cmd_latex = [
        "pandoc", md_path,
        "-o", latex_path,
        f"--template={template_path}",
        "--syntax-highlighting=kate",
    ]
    print("Step 1: Generating LaTeX...")
    r1 = subprocess.run(cmd_latex, capture_output=True, text=True)
    if r1.returncode != 0:
        print("Pandoc error:", r1.stderr[-2000:])
        raise SystemExit(1)

    # Step 2: Post-process LaTeX to fix longtable issues
    print("Step 2: Fixing longtable for twocolumn...")
    latex_content = Path(latex_path).read_text()
    # Add nonstopmode to prevent halting on recoverable errors
    latex_content = latex_content.replace(
        r'\begin{document}',
        r'\nonstopmode' + '\n' + r'\begin{document}'
    )
    latex_content = fix_longtable_in_latex(latex_content)
    Path(latex_path).write_text(latex_content)

    # Step 3: Compile with tectonic
    print("Step 3: Compiling PDF with tectonic...")
    # Do not keep intermediates; it creates noisy .aux/.out files in docs/.
    cmd_pdf = ["tectonic", "-X", "compile", latex_path, "-o", str(DOCS_DIR)]
    r2 = subprocess.run(cmd_pdf, capture_output=True, text=True)

    # Check if PDF was actually produced (nonstopmode means exit code may still be non-zero)
    tex_name = Path(latex_path).stem
    generated_pdf = DOCS_DIR / f"{tex_name}.pdf"
    if not generated_pdf.exists() and r2.returncode != 0:
        print("Tectonic error:", r2.stderr[-3000:])
        raise SystemExit(1)

    # Rename output (tectonic names it after the .tex file)
    tex_name = Path(latex_path).stem
    generated_pdf = DOCS_DIR / f"{tex_name}.pdf"
    if generated_pdf.exists():
        generated_pdf.rename(OUTPUT_PDF)

    if r2.stderr:
        warnings = [l for l in r2.stderr.split('\n') if 'warning' in l.lower()]
        if warnings:
            print(f"({len(warnings)} warnings during compilation)")

    print(f"PDF written to {OUTPUT_PDF}")

    # Clean up
    for p in [template_path, md_path, latex_path]:
        Path(p).unlink(missing_ok=True)


if __name__ == "__main__":
    main()
