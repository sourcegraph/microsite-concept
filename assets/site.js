(function () {
  const doc = document;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const demoScenarios = [
    {
      query: "A function in microsoft/vscode implements a three-way merge algorithm for Settings Sync that reconciles local, remote, and base versions, producing four sets: added, removed, updated, and conflicts. Identify the function and the file it lives in.",
      without: {
        confidence: 33,
        segments: [
          { text: "The function is " },
          { text: "merge", className: "bad-file" },
          { text: " in " },
          { text: "userDataSync/common/settingsMerge.ts", className: "bad-file" },
          { text: ". It compares local and remote settings against a shared base and returns categorized change sets." }
        ]
      },
      with: {
        confidence: 100,
        logs: [
          'keyword_search({ query: "three-way merge" })',
          'keyword_search({ query: "Settings Sync merge conflicts" })',
          'keyword_search({ query: "added removed updated conflicts" })',
          'read_file({ path: "...common/settingsMerge.ts" })',
          'read_file({ path: "...common/keybindingsMerge.ts" })',
          'keyword_search({ query: "export function merge local remote" })'
        ],
        segments: [
          { text: "The function is " },
          { text: "computeMergeResult", className: "good-file" },
          { text: " in " },
          { text: "userDataSync/common/keybindingsMerge.ts", className: "good-file" },
          { text: ". It performs a three-way merge of keybinding settings, reconciling local/remote/base versions and producing categorized sets of added, removed, updated, and conflicting entries." }
        ]
      }
    },
    {
      query: "Find all Java source files in Apache Flink under flink-streaming-java/src/ that contain @Deprecated annotations on DataStream API classes or methods. For each deprecated class, identify the class name and the recommended replacement.",
      without: {
        confidence: 35,
        segments: [
          { text: "Three deprecated classes found: AscendingTimestampExtractor (replace with WatermarkStrategy), TextInputFormat, and TextOutputFormat (replace with Source API). These are under streaming/api/. " },
          { text: "No other deprecated DataStream classes exist in this tree.", className: "bad-file" }
        ]
      },
      with: {
        confidence: 100,
        logs: [
          'list_files({ path: "...streaming/api/" })',
          'keyword_search({ query: "@Deprecated", path: "flink-streaming-java/src/" })',
          'read_file({ path: "...source/DataGeneratorSource.java" })',
          'read_file({ path: "...sink/TwoPhaseCommitSinkFunction.java" })',
          'list_files({ path: "...api/io/" })',
          'read_file({ path: "...file/sink/StreamingFileSink.java" })'
        ],
        segments: [
          { text: "Seven deprecated DataStream API classes found: " },
          { text: "DataGeneratorSource", className: "good-file" },
          { text: ", DiscardingSink, TwoPhaseCommitSinkFunction, AscendingTimestampExtractor, TextInputFormat, TextOutputFormat, and " },
          { text: "StreamingFileSink", className: "good-file" },
          { text: ". Indexed search found all deprecated classes regardless of nesting depth, including files in " },
          { text: "functions/sink/legacy/", className: "good-file" },
          { text: " that the baseline grep missed." }
        ]
      }
    },
    {
      query: "A bug in Grafana's v38 dashboard migration silently drops table panel fieldConfig.defaults.custom during import. Find the Go source files implementing the v38 schema migration, the function handling fieldConfig merging, and the schema version constant file.",
      without: {
        confidence: 62,
        segments: [
          { text: "The v38 schema migration is handled in " },
          { text: "dashboard/state/DashboardMigrator.ts", className: "bad-file" },
          { text: ", with the fieldConfig merge logic in the " },
          { text: "updateSchema", className: "bad-file" },
          { text: " function. Schema version constants are co-located in the same frontend module." }
        ]
      },
      with: {
        confidence: 93,
        logs: [
          'keyword_search({ query: "v38 migration" })',
          'keyword_search({ query: "dashboardimport fieldConfig" })',
          'list_files({ path: "pkg/services/dashboardimport/" })',
          'read_file({ path: "...dashboardimport/v38.go" })',
          'nls_search({ query: "v38 fieldConfig merge" })',
          'read_file({ path: "...dashboardimport/migrations.go" })'
        ],
        segments: [
          { text: "The v38 migration is implemented in " },
          { text: "pkg/services/dashboardimport/v38.go", className: "good-file" },
          { text: ", with " },
          { text: "processPanelsV38", className: "good-file" },
          { text: " containing the flawed fieldConfig.defaults.custom merge conditional. The schema version constant V38 is registered in " },
          { text: "migrations.go", className: "good-file" },
          { text: " via GetMigrations." }
        ]
      }
    },
    {
      query: "Find all Java source files in Apache Kafka under core/src/main/ and clients/src/main/ implementing ACL authorization logic. For each file, report the class name and whether it defines the authorization interface, implements it, or provides utilities.",
      without: {
        confidence: 26,
        segments: [
          { text: "The core ACL interface is Authorizer.java in clients/.../security/authorizer/, with AclAuthorizer in core/src/main/scala/. Supporting classes include Action.java and KafkaPrincipal.java. " },
          { text: "Authorization logic is contained within these two directories.", className: "bad-file" }
        ]
      },
      with: {
        confidence: 49,
        logs: [
          'keyword_search({ query: "Authorizer OR AclAuthorizer" })',
          'nls_search({ query: "authorizer implementation ACL" })',
          'keyword_search({ query: "implements Authorizer" })',
          'keyword_search({ query: "ClusterMetadataAuthorizer" })',
          'list_files({ path: "...main/.../authorizer/" })',
          'read_file({ path: "...StandardAuthorizer.java" })'
        ],
        segments: [
          { text: "21 files across four modules: the Authorizer interface in " },
          { text: "clients/", className: "good-file" },
          { text: ", ClusterMetadataAuthorizer and StandardAuthorizer implementations in " },
          { text: "metadata/", className: "good-file" },
          { text: " and " },
          { text: "server/", className: "good-file" },
          { text: ", plus supporting classes (AclEntry, AclMutator, StandardAcl, AclCache) and the legacy AclApis.scala in core/. Authorization logic has migrated from core/ to metadata/ and server/ in recent releases." }
        ]
      }
    }
  ];

  const protocolNodes = [
    { title: "Agent", text: "plans what to ask" },
    { title: "MCP Client", text: "lists resources, reads context, and calls tools" },
    { title: "MCP Server", text: "exposes capabilities, authentication, and protocol surface" },
    { title: "Retrieval Layer", text: "provides search, navigation, history, ownership, and deep analysis" },
    { title: "Codebase", text: "stays the ground truth the model retrieves from" }
  ];

  const landingWalkthrough = [
    ["00:00", "Plan", "Task asks for a bug fix in auth plus tests. The agent decides it needs call sites, definitions, and team conventions."],
    ["00:02", "Discover", "Sourcegraph MCP exposes repo discovery, file reads, semantic and keyword search, definitions, references, revision history, contributor lookups, and Deep Search."],
    ["00:04", "Retrieve", "The agent runs nls_search for the feature area, then jumps to definitions and reads only the relevant files."],
    ["00:07", "Synthesize", "It now understands the auth boundary, downstream callers, and the existing error handling pattern."],
    ["00:10", "Act", "The agent edits grounded code, updates tests, and explains the blast radius with evidence instead of guesses."]
  ];

  const guideWalkthrough = [
    ["00:00", "Scope", "The host connects to the MCP server and the agent lists the available tool surface before it starts guessing."],
    ["00:03", "Discover", "It identifies the repositories and files that matter, then decides whether semantic search or exact search is the better first move."],
    ["00:07", "Navigate", "Search results become definitions, references, and targeted file reads instead of a giant prompt dump."],
    ["00:12", "Inspect history", "If the question depends on prior intent, the agent compares revisions or searches commits and diffs."],
    ["00:17", "Deep analysis", "For multi-hop questions, Deep Search synthesizes the evidence into a longer research thread the host can reopen later."],
    ["00:22", "Act", "Only after the context is grounded does the agent answer, review, refactor, or automate the next step."]
  ];

  const useCaseSpotlights = {
    existing: {
      title: "Understanding existing code",
      text: "Ask where a symbol is defined, which services call it, and which docs explain the surrounding architecture. The agent can answer with file paths and dependencies instead of hand-wavy summaries."
    },
    quality: {
      title: "Consistency and quality",
      text: "Agents can inspect how the codebase already handles auth, logging, retries, or error mapping, then implement the same pattern instead of inventing a new one."
    },
    refactor: {
      title: "Codebase-wide refactoring",
      text: "When a shared interface changes, the agent can trace every reference, compare revisions, and understand the real blast radius before it edits anything."
    },
    bug: {
      title: "Fixing bugs",
      text: "Instead of guessing from a stack trace, the agent can jump from an erroring call site to the owning symbol, read the adjacent code, and inspect related commits."
    },
    feature: {
      title: "Implementing new features",
      text: "A retrieval layer lets the agent find the closest working pattern in the codebase and extend it with the same conventions, tests, and boundaries."
    },
    review: {
      title: "Code review",
      text: "Review agents can verify whether a change matches existing patterns, touches all downstream usages, and silently breaks consumers in other repos."
    },
    debug: {
      title: "Troubleshooting and debugging",
      text: "Use Deep Search and history tools to connect symptoms to the relevant code, recent diffs, and ownership clues across services."
    }
  };

  function ready(fn) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function qs(selector, root = doc) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = doc) {
    return Array.from(root.querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getScrollOffset() {
    return (qs(".site-utility")?.offsetHeight || 0) + 24;
  }

  function scrollToSection(target, behavior) {
    const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top, behavior });
  }

  function setProgressBar() {
    const progress = qs(".page-progress");
    if (!progress) return;

    const update = () => {
      const root = doc.documentElement;
      const total = root.scrollHeight - window.innerHeight;
      const ratio = total <= 0 ? 0 : clamp(window.scrollY / total, 0, 1);
      progress.style.width = `${ratio * 100}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initRevealObserver() {
    const reveals = qsa(".reveal");
    if (!reveals.length) return;

    if (reduceMotion) {
      reveals.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((node) => observer.observe(node));
  }

  function initSmoothLinks() {
    qsa('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = link.getAttribute("href");
        if (!target || target === "#") return;
        const section = qs(target);
        if (!section) return;
        event.preventDefault();
        scrollToSection(section, reduceMotion ? "auto" : "smooth");
      });
    });
  }

  function scrollToHashOnLoad() {
    const hash = window.location.hash;
    if (!hash) return;

    const apply = () => {
      const selector = hash === "#inside-outside-loop" ? "#context-loop" : hash;
      const target = qs(selector);
      if (!target) return;
      scrollToSection(target, "auto");
    };

    apply();
    window.addEventListener("load", apply, { once: true });
    window.setTimeout(apply, 250);
  }

  function initChapterRail() {
    const rail = qs(".chapter-rail");
    const states = qsa("[data-chapter-target]")
      .map((link) => {
        const id = link.getAttribute("data-chapter-target");
        const section = id ? qs(`#${id}`) : null;
        if (!id || !section) return null;
        return { id, link, section };
      })
      .filter(Boolean);

    if (!states.length) return;

    let activeId = "";
    const gateId = rail?.getAttribute("data-chapter-gate");
    const gateSection = gateId ? qs(`#${gateId}`) : null;

    const setActive = (id) => {
      if (!id || id === activeId) return;
      activeId = id;

      states.forEach((state) => {
        const active = state.id === id;
        state.link.classList.toggle("is-active", active);
        if (active) {
          state.link.setAttribute("aria-current", "location");
        } else {
          state.link.removeAttribute("aria-current");
        }
      });
    };

    const syncVisibility = () => {
      if (!rail || !gateSection) return;
      const pivot = window.scrollY + getScrollOffset() + Math.min(window.innerHeight * 0.18, 180);
      rail.classList.toggle("is-gated-hidden", pivot < gateSection.offsetTop);
    };

    const syncActive = () => {
      const pivot = window.scrollY + getScrollOffset() + Math.min(window.innerHeight * 0.22, 220);
      let current = states[0].id;

      states.forEach((state) => {
        if (state.section.offsetTop <= pivot) {
          current = state.id;
        }
      });

      setActive(current);
    };

    syncVisibility();
    syncActive();
    window.addEventListener("scroll", syncVisibility, { passive: true });
    window.addEventListener("resize", syncVisibility);
    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
  }

  function initUtilityBar() {
    const utility = qs(".site-utility");
    if (!utility) return;

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const revealThreshold = 84;
    let rafId = 0;
    let shouldReveal = false;

    const syncVisibility = () => {
      rafId = 0;
      const shouldHide = hoverQuery.matches && window.innerWidth > 900 && window.scrollY > 18;
      utility.classList.toggle("is-hidden", shouldHide);
      utility.classList.toggle("is-revealed", shouldHide && shouldReveal);
    };

    const requestSync = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(syncVisibility);
    };

    const handlePointerMove = (event) => {
      const nextReveal = event.clientY <= revealThreshold;
      if (nextReveal === shouldReveal) return;
      shouldReveal = nextReveal;
      requestSync();
    };

    const handleFocusIn = () => {
      shouldReveal = true;
      requestSync();
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        if (utility.contains(doc.activeElement)) return;
        shouldReveal = false;
        requestSync();
      }, 0);
    };

    syncVisibility();

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", () => {
      shouldReveal = false;
      requestSync();
    });
    utility.addEventListener("mouseenter", handleFocusIn);
    utility.addEventListener("focusin", handleFocusIn);
    utility.addEventListener("focusout", handleFocusOut);

    if (hoverQuery.addEventListener) {
      hoverQuery.addEventListener("change", requestSync);
    } else if (hoverQuery.addListener) {
      hoverQuery.addListener(requestSync);
    }
  }

  function initCopyButtons() {
    qsa("[data-copy-source]").forEach((button) => {
      button.addEventListener("click", async () => {
        const selector = button.getAttribute("data-copy-source");
        const source = selector ? qs(selector) : null;
        if (!source) return;
        const text = source.textContent?.trim() || "";

        try {
          await navigator.clipboard.writeText(text);
          const original = button.textContent;
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = original || "Copy";
          }, 1200);
        } catch (error) {
          console.error(error);
        }
      });
    });
  }

  function initTabs() {
    qsa("[data-tab-group]").forEach((group) => {
      const buttons = qsa("[data-tab-target]", group);
      const panels = qsa("[data-tab-panel]", group);
      if (!buttons.length || !panels.length) return;

      const activate = (target) => {
        buttons.forEach((button) => {
          const active = button.getAttribute("data-tab-target") === target;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
        });

        panels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-tab-panel") === target);
        });
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => activate(button.getAttribute("data-tab-target")));
      });

      const defaultTarget = buttons.find((button) => button.classList.contains("is-active"))?.getAttribute("data-tab-target") || buttons[0].getAttribute("data-tab-target");
      activate(defaultTarget);
    });
  }

  function initTicker() {
    qsa("[data-ticker-track]").forEach((track) => {
      if (track.dataset.enhanced === "true") return;
      track.dataset.enhanced = "true";
      track.innerHTML += track.innerHTML;
    });
  }

  function animateCount(element, target) {
    const suffix = element.dataset.suffix || "";
    const duration = reduceMotion ? 0 : 1100;

    if (duration === 0) {
      element.textContent = `${target}${suffix}`;
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const current = Math.round(easeOutCubic(progress) * target);
      element.textContent = `${current}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  function initCounters() {
    qsa("[data-count-target]").forEach((counter) => {
      let hasRun = false;
      const target = Number(counter.getAttribute("data-count-target"));
      if (Number.isNaN(target)) return;

      const run = () => {
        if (hasRun) return;
        hasRun = true;
        animateCount(counter, target);
      };

      if (reduceMotion) {
        run();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(counter);
    });
  }

  function initPageIntro() {
    const intro = doc.getElementById("pageIntro");
    if (!intro || reduceMotion) {
      if (intro) intro.remove();
      return;
    }

    // Spotlight sweep path: [x%, y%] waypoints
    const path = [
      { x: -15, y: 55 },
      { x:  20, y: 40 },
      { x:  55, y: 50 },
      { x:  30, y: 43 },
      { x:  28, y: 43 },
    ];

    const duration = 2600;
    const start = performance.now();

    function lerp(a, b, t) { return a + (b - a) * t; }
    function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function pointAt(progress) {
      const scaled = progress * (path.length - 1);
      const i = Math.min(Math.floor(scaled), path.length - 2);
      const t = ease(scaled - i);
      return {
        x: lerp(path[i].x, path[i + 1].x, t),
        y: lerp(path[i].y, path[i + 1].y, t),
      };
    }

    function tick(now) {
      const progress = Math.max(0, Math.min((now - start) / duration, 1));
      const pt = pointAt(progress);
      intro.style.setProperty("--bx", `${pt.x}%`);
      intro.style.setProperty("--by", `${pt.y}%`);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        intro.classList.add("is-done");
        setTimeout(() => intro.remove(), 700);
      }
    }

    requestAnimationFrame(tick);
  }

  function initTypewriter() {
    const target = qs("[data-typewriter]");
    if (!target) return;
    const text = target.getAttribute("data-typewriter") || target.textContent || "";
    target.textContent = text;
  }

  function initHeroScene() {
    const scene = qs("#heroScene");
    if (!scene) return;

    let auto = !reduceMotion;
    let rafId = 0;
    let frame = 0;

    const setPointer = (x, y) => {
      scene.style.setProperty("--pointer-x", `${clamp(x, 8, 92)}%`);
      scene.style.setProperty("--pointer-y", `${clamp(y, 10, 90)}%`);
    };

    const awaken = () => {
      scene.classList.add("is-lit");
    };

    const syncFromEvent = (event) => {
      const rect = scene.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setPointer(x, y);
    };

    const animate = () => {
      if (auto) {
        frame += 0.008;
        const x = 74 + Math.cos(frame) * 9;
        const y = 44 + Math.sin(frame * 1.2) * 14;
        setPointer(x, y);
      }
      rafId = requestAnimationFrame(animate);
    };

    scene.addEventListener("pointermove", (event) => {
      auto = false;
      syncFromEvent(event);
    });

    scene.addEventListener("pointerleave", () => {
      if (!reduceMotion) {
        auto = true;
      }
    });

    scene.addEventListener("click", awaken);
    qs("#heroCta")?.addEventListener("click", awaken);

    setPointer(76, 42);

    if (!reduceMotion) {
      animate();
      window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId), { once: true });
    }
  }

  async function typeSegments(node, segments, shouldAbort) {
    node.innerHTML = "";

    if (reduceMotion) {
      node.innerHTML = segments
        .map((segment) => `<span class="${segment.className || ""}">${segment.text}</span>`)
        .join("");
      return;
    }

    for (const segment of segments) {
      const span = doc.createElement("span");
      if (segment.className) span.className = segment.className;
      node.appendChild(span);

      for (const char of segment.text) {
        if (shouldAbort && shouldAbort()) return;
        span.textContent += char;
        await sleep(segment.className ? 13 : 16);
      }
    }
  }

  function initProblemDemo() {
    const stage = qs("#problemDemo");
    if (!stage) return;

    const pills = qsa("[data-question-index]");
    const leftConsole = qs(".contrast-column .console-view", stage);
    const leftQuery = qs("#withoutQuery");
    const leftResponse = qs("#withoutResponse");
    const leftValue = qs("#withoutConfidence");
    const leftFill = qs("#withoutConfidenceFill");
    const rightConsole = qs(".contrast-column-lit .console-view", stage);
    const rightQuery = qs("#withQuery");
    const rightResponse = qs("#withResponse");
    const rightValue = qs("#withConfidence");
    const rightFill = qs("#withConfidenceFill");
    const logsContainer = qs("#contextLogs");

    if (!pills.length || !leftConsole || !leftQuery || !leftResponse || !leftValue || !leftFill || !rightConsole || !rightQuery || !rightResponse || !rightValue || !rightFill || !logsContainer) {
      return;
    }

    const renderSegmentsHtml = (segments) =>
      segments
        .map((segment) => `<span class="${segment.className || ""}">${escapeHtml(segment.text)}</span>`)
        .join("");

    const measureConsoleHeight = (source, fillScenario, side) => {
      const width = Math.round(source.getBoundingClientRect().width);
      if (!width) return 0;

      const clone = source.cloneNode(true);
      clone.style.width = `${width}px`;
      clone.style.flex = "none";
      clone.style.minHeight = "0";
      clone.style.height = "auto";

      if (side === "left") {
        qs("#withoutQuery", clone).textContent = fillScenario.query;
        qs("#withoutResponse", clone).innerHTML = renderSegmentsHtml(fillScenario.without.segments);
        qs("#withoutConfidence", clone).textContent = `${fillScenario.without.confidence}%`;
        qs("#withoutConfidenceFill", clone).style.width = `${fillScenario.without.confidence}%`;
      } else {
        qs("#withQuery", clone).textContent = fillScenario.query;
        qs("#withResponse", clone).innerHTML = renderSegmentsHtml(fillScenario.with.segments);
        qs("#withConfidence", clone).textContent = `${fillScenario.with.confidence}%`;
        qs("#withConfidenceFill", clone).style.width = `${fillScenario.with.confidence}%`;
        qs("#contextLogs", clone).innerHTML = fillScenario.with.logs
          .map((log) => `<div class="log-line is-live">${escapeHtml(`→ ${log}`)}</div>`)
          .join("");
      }

      const measureLayer = doc.createElement("div");
      measureLayer.setAttribute("aria-hidden", "true");
      measureLayer.style.position = "absolute";
      measureLayer.style.left = "0";
      measureLayer.style.top = "0";
      measureLayer.style.visibility = "hidden";
      measureLayer.style.pointerEvents = "none";
      measureLayer.style.zIndex = "-1";
      measureLayer.appendChild(clone);
      doc.body.appendChild(measureLayer);

      const height = clone.getBoundingClientRect().height;
      measureLayer.remove();
      return height;
    };

    const lockConsoleHeights = () => {
      const maxHeight = demoScenarios.reduce((largest, scenario) => {
        const leftHeight = measureConsoleHeight(leftConsole, scenario, "left");
        const rightHeight = measureConsoleHeight(rightConsole, scenario, "right");
        return Math.max(largest, leftHeight, rightHeight);
      }, 0);

      if (!maxHeight) return;
      const lockedHeight = `${Math.ceil(maxHeight)}px`;
      leftConsole.style.minHeight = lockedHeight;
      rightConsole.style.minHeight = lockedHeight;
    };

    let activeIndex = 0;
    let token = 0;
    let hasStarted = false;
    let resizeFrame = 0;

    const renderScenario = async (index) => {
      token += 1;
      const localToken = token;
      activeIndex = index;
      pills.forEach((pill, pillIndex) => pill.classList.toggle("is-active", pillIndex === index));

      const scenario = demoScenarios[index];
      if (!scenario) return;

      leftQuery.textContent = scenario.query;
      rightQuery.textContent = scenario.query;
      leftResponse.innerHTML = "";
      rightResponse.innerHTML = "";
      logsContainer.innerHTML = "";
      leftValue.textContent = "0%";
      rightValue.textContent = "0%";
      leftFill.style.width = "0%";
      rightFill.style.width = "0%";

      const abort = () => localToken !== token;

      await Promise.all([
        typeSegments(leftResponse, scenario.without.segments, abort),
        typeSegments(rightResponse, scenario.with.segments, abort),
        (async () => {
          for (const log of scenario.with.logs) {
            if (abort()) return;
            const row = doc.createElement("div");
            row.className = "log-line";
            row.textContent = `→ ${log}`;
            logsContainer.appendChild(row);
            requestAnimationFrame(() => row.classList.add("is-live"));
            await sleep(reduceMotion ? 0 : 150);
          }
        })()
      ]);

      if (localToken !== token) return;
      leftValue.textContent = `${scenario.without.confidence}%`;
      rightValue.textContent = `${scenario.with.confidence}%`;
      leftFill.style.width = `${scenario.without.confidence}%`;
      rightFill.style.width = `${scenario.with.confidence}%`;
    };

    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const index = Number(pill.getAttribute("data-question-index"));
        renderScenario(index);
      });
    });

    lockConsoleHeights();
    window.addEventListener("resize", () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        lockConsoleHeights();
        if (hasStarted) {
          renderScenario(activeIndex);
        }
      });
    });

    const start = () => {
      if (hasStarted) return;
      hasStarted = true;
      renderScenario(0);
    };

    if (reduceMotion) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          start();
          observer.disconnect();
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(stage);
  }

  function initProtocolRail() {
    const rail = qs("#protocolRail");
    const title = qs("#protocolTitle");
    const text = qs("#protocolText");
    const buttons = qsa("[data-node-index]", rail || doc);

    if (!rail || !title || !text || !buttons.length) return;

    let activeIndex = 0;
    let autoTimer = 0;

    const activate = (index) => {
      const state = protocolNodes[index];
      if (!state) return;
      activeIndex = index;
      title.textContent = state.title;
      text.textContent = state.text;
      buttons.forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
    };

    const startAuto = () => {
      if (reduceMotion) return;
      clearInterval(autoTimer);
      autoTimer = window.setInterval(() => {
        activate((activeIndex + 1) % protocolNodes.length);
      }, 3200);
    };

    buttons.forEach((button) => {
      const index = Number(button.getAttribute("data-node-index"));
      const run = () => {
        activate(index);
        startAuto();
      };
      button.addEventListener("mouseenter", run);
      button.addEventListener("focus", run);
      button.addEventListener("click", run);
    });

    activate(0);
    startAuto();

    rail.addEventListener("mouseenter", () => clearInterval(autoTimer), { passive: true });
    rail.addEventListener("mouseleave", startAuto, { passive: true });
  }

  function initWalkthrough() {
    const walkthroughs = [
      { selector: "#landingWalkthrough", rows: landingWalkthrough },
      { selector: "#guideWalkthrough", rows: guideWalkthrough }
    ];

    walkthroughs.forEach(({ selector, rows }) => {
      const container = qs(selector);
      if (!container) return;

      let hasPlayed = false;

      const render = async () => {
        if (hasPlayed) return;
        hasPlayed = true;
        container.innerHTML = "";

        for (const [time, title, body] of rows) {
          const row = doc.createElement("div");
          row.className = "walkthrough-line";
          row.innerHTML = `<time>${time}</time><div><strong>${title}</strong><p>${body}</p></div>`;
          container.appendChild(row);
          requestAnimationFrame(() => row.classList.add("is-live"));
          if (!reduceMotion) {
            await sleep(240);
          }
        }
      };

      if (reduceMotion) {
        render();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              render();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(container);
    });
  }

  function initSpotlight() {
    const title = qs("[data-spotlight-title]");
    const text = qs("[data-spotlight-text]");
    const buttons = qsa("[data-spotlight-key]");
    if (!title || !text || !buttons.length) return;

    const activate = (key) => {
      const state = useCaseSpotlights[key];
      if (!state) return;
      title.textContent = state.title;
      text.textContent = state.text;
      buttons.forEach((button) => button.classList.toggle("is-active", button.getAttribute("data-spotlight-key") === key));
    };

    buttons.forEach((button) => {
      const key = button.getAttribute("data-spotlight-key");
      button.addEventListener("mouseenter", () => activate(key));
      button.addEventListener("focus", () => activate(key));
      button.addEventListener("click", () => activate(key));
    });

    activate(buttons[0].getAttribute("data-spotlight-key"));
  }

  function initLoopCanvas() {
    const shell = qs("#loopShell");
    const canvas = qs("#loopCanvas");
    const centerTitle = qs("#loopStageTitle");
    const centerDescription = qs("#loopStageDescription");
    const points = qsa(".loop-point");
    if (!shell || !canvas || !centerTitle || !centerDescription || !points.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let radius = 0;
    let activeIndex = 0;
    let rafId = 0;
    let autoId = 0;

    const stages = points.map((point) => ({
      title: point.getAttribute("data-title") || "",
      description: point.getAttribute("data-description") || "",
      angle: Number(point.getAttribute("data-angle")) || 0
    }));

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      radius = Math.min(width, height) * 0.34;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      positionPoints();
    };

    const positionPoints = () => {
      points.forEach((point, index) => {
        const angle = (stages[index].angle * Math.PI) / 180;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        point.style.left = `${x}px`;
        point.style.top = `${y}px`;
      });
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(centerX, centerY);

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const rotation = reduceMotion ? 0 : now * 0.00018;
      const gradient = ctx.createLinearGradient(-radius, 0, radius, 0);
      gradient.addColorStop(0, "rgba(255, 224, 163, 0.14)");
      gradient.addColorStop(0.5, "rgba(255, 224, 163, 0.62)");
      gradient.addColorStop(1, "rgba(105, 217, 208, 0.48)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius, rotation, rotation + Math.PI * 1.18);
      ctx.stroke();

      const activeAngle = (stages[activeIndex].angle * Math.PI) / 180;
      const dotX = Math.cos(activeAngle) * radius;
      const dotY = Math.sin(activeAngle) * radius;
      ctx.fillStyle = "#ffe0a3";
      ctx.shadowBlur = 26;
      ctx.shadowColor = "rgba(255, 224, 163, 0.85)";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      rafId = requestAnimationFrame(draw);
    };

    const activateStage = (index) => {
      const state = stages[index];
      if (!state) return;
      activeIndex = index;
      centerTitle.textContent = state.title;
      centerDescription.textContent = state.description;
      points.forEach((point, pointIndex) => point.classList.toggle("active", pointIndex === index));
    };

    const startAuto = () => {
      clearInterval(autoId);
      autoId = window.setInterval(() => {
        activateStage((activeIndex + 1) % stages.length);
      }, reduceMotion ? 4000 : 3000);
    };

    points.forEach((point, index) => {
      const run = () => {
        activateStage(index);
        startAuto();
      };
      point.addEventListener("mouseenter", run);
      point.addEventListener("focus", run);
      point.addEventListener("click", run);
    });

    resize();
    activateStage(0);
    draw(0);
    startAuto();

    window.addEventListener("resize", resize);
    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId), { once: true });
  }

  ready(() => {
    scrollToHashOnLoad();
    setProgressBar();
    initRevealObserver();
    initSmoothLinks();
    initChapterRail();
    initUtilityBar();
    initCopyButtons();
    initTabs();
    initPageIntro();
    initTicker();
    initCounters();
    initTypewriter();
    initHeroScene();
    initProblemDemo();
    initProtocolRail();
    initWalkthrough();
    initSpotlight();
    initLoopCanvas();
  });
})();
