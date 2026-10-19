/**
 * MLRC Core Web Application Controller
 * Handles page rendering, dynamic data hydration, filtering, and interactions
 */
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

import papersData from './data/papers.json';
import projectsData from './data/projects.json';
import eventsData from './data/events.json';
import membersData from './data/members.json';
import faqsData from './data/faqs.json';

import { initNeuralCanvas } from './scripts/neural-canvas.js';
import { openModal, closeModal } from './scripts/modal.js';
import { showToast } from './scripts/toast.js';
import { copyToClipboard, downloadIcsFile, initNavigation, initThemeToggle } from './scripts/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initNewsletterForm();

  // Page detection
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path === 'index.html' || path === '') {
    initHomePage();
  } else if (path === 'research.html') {
    initResearchPage();
  } else if (path === 'projects.html') {
    initProjectsPage();
  } else if (path === 'events.html') {
    initEventsPage();
  } else if (path === 'members.html') {
    initMembersPage();
  } else if (path === 'join.html') {
    initJoinPage();
  }
});

function initNewsletterForm() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value) {
        showToast('Subscribed to the MLRC Dispatch! Welcome aboard.');
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   Home Page Controller
   ========================================================================== */
function initHomePage() {
  initNeuralCanvas('hero-canvas');

  // Hydrate Featured Paper
  const featuredPaperContainer = document.getElementById('home-featured-paper');
  if (featuredPaperContainer && papersData.length > 0) {
    const paper = papersData[0];
    featuredPaperContainer.innerHTML = `
      <div class="glass-card spotlight-card">
        <div class="spotlight-badge">★ Conference Spotlight</div>
        <h3 class="paper-title" style="margin-bottom: 0.5rem;">${paper.title}</h3>
        <p class="paper-authors" style="margin-bottom: 0.75rem;">${paper.authors.join(', ')}</p>
        <div style="margin-bottom: 1rem;">
          <span class="badge badge-indigo">${paper.venue}</span>
          <span class="badge badge-cyan">${paper.track}</span>
        </div>
        <p class="paper-abstract" style="margin-bottom: 1.5rem;">${paper.abstract}</p>
        <div class="paper-actions">
          <a href="${paper.pdfUrl}" target="_blank" rel="noopener noreferrer" class="action-chip">📄 PDF Paper</a>
          <a href="${paper.codeUrl}" target="_blank" rel="noopener noreferrer" class="action-chip">💻 Code Repo</a>
          <button class="action-chip" id="home-copy-bibtex" data-id="${paper.id}">📋 BibTeX</button>
          <a href="research.html" class="action-chip" style="margin-left: auto; color: var(--accent-secondary);">View All 15+ Papers →</a>
        </div>
      </div>
    `;

    document.getElementById('home-copy-bibtex')?.addEventListener('click', () => {
      openBibtexModal(paper);
    });
  }

  // Hydrate Featured Projects (first 3)
  const featuredProjectsContainer = document.getElementById('home-featured-projects');
  if (featuredProjectsContainer) {
    const featuredList = projectsData.filter(p => p.featured).slice(0, 3);
    featuredProjectsContainer.innerHTML = featuredList.map(proj => `
      <div class="glass-card project-card">
        <div class="project-top">
          <div class="project-title-row">
            <h4 class="project-name">${proj.name}</h4>
            <span class="project-metrics-pill">⚡ ${proj.metrics}</span>
          </div>
          <p class="project-tagline">${proj.tagline}</p>
          <div class="project-tags">
            ${proj.tags.map(t => `<span class="badge badge-indigo">${t}</span>`).join('')}
          </div>
        </div>
        <div class="project-bottom">
          <span class="project-contributors">Lead: ${proj.contributors[0]}</span>
          <button class="btn btn-secondary btn-sm open-proj-modal-btn" data-id="${proj.id}">Explore</button>
        </div>
      </div>
    `).join('');

    bindProjectModalTriggers(featuredProjectsContainer);
  }

  // Hydrate Next Upcoming Event
  const homeEventContainer = document.getElementById('home-upcoming-event');
  if (homeEventContainer) {
    const nextEvent = eventsData.find(e => e.status === 'upcoming');
    if (nextEvent) {
      homeEventContainer.innerHTML = `
        <div class="glass-card" style="border-color: rgba(99, 102, 241, 0.4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <span class="badge badge-cyan">${nextEvent.type}</span>
            <span class="badge badge-emerald">● Upcoming Event</span>
          </div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">${nextEvent.title}</h3>
          <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1rem;">
            📅 ${nextEvent.displayDate} &nbsp;|&nbsp; ⏰ ${nextEvent.time} &nbsp;|&nbsp; 📍 ${nextEvent.location}
          </p>
          <div class="event-speaker-info" style="margin-bottom: 1.5rem;">
            <div class="speaker-avatar-circle">${nextEvent.speaker.name.charAt(0)}</div>
            <div>
              <div style="font-weight: 600; color: #fff;">${nextEvent.speaker.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${nextEvent.speaker.affiliation}</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <a href="${nextEvent.rsvpUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">RSVP Free</a>
            <button class="btn btn-secondary btn-sm ics-download-btn" data-id="${nextEvent.id}">Add to Calendar</button>
            <a href="events.html" class="btn btn-ghost btn-sm" style="margin-left: auto;">All Events →</a>
          </div>
        </div>
      `;

      homeEventContainer.querySelector('.ics-download-btn')?.addEventListener('click', () => {
        downloadIcsFile(nextEvent);
      });
    }
  }
}

/* ==========================================================================
   Research Page Controller
   ========================================================================== */
function initResearchPage() {
  const papersListEl = document.getElementById('papers-list');
  const searchInput = document.getElementById('papers-search');
  const trackFilters = document.querySelectorAll('.track-filter-btn');

  let activeTrack = 'all';
  let searchQuery = '';

  function renderPapers() {
    if (!papersListEl) return;

    const filtered = papersData.filter(paper => {
      const matchesTrack = activeTrack === 'all' || paper.track.toLowerCase().includes(activeTrack.toLowerCase());
      const searchContent = `${paper.title} ${paper.authors.join(' ')} ${paper.abstract} ${paper.venue}`.toLowerCase();
      const matchesSearch = searchContent.includes(searchQuery.toLowerCase());
      return matchesTrack && matchesSearch;
    });

    if (filtered.length === 0) {
      papersListEl.innerHTML = `
        <div class="glass-card" style="text-align: center; padding: 3rem;">
          <p style="font-size: 1.1rem; color: var(--text-muted);">No publications matching "${searchQuery}" in this track.</p>
        </div>
      `;
      return;
    }

    papersListEl.innerHTML = filtered.map(paper => `
      <article class="glass-card paper-card" id="${paper.id}">
        <div class="paper-header">
          <div>
            <h3 class="paper-title">${paper.title}</h3>
            <p class="paper-authors">${paper.authors.join(', ')}</p>
          </div>
          <span class="paper-venue-badge">${paper.venue}</span>
        </div>
        <p class="paper-abstract">${paper.abstract}</p>
        <div class="paper-actions">
          <span class="badge badge-cyan">${paper.track}</span>
          <span class="badge badge-indigo">${paper.year}</span>
          ${paper.pdfUrl ? `<a href="${paper.pdfUrl}" target="_blank" rel="noopener noreferrer" class="action-chip">📄 PDF Paper</a>` : ''}
          ${paper.codeUrl ? `<a href="${paper.codeUrl}" target="_blank" rel="noopener noreferrer" class="action-chip">💻 Code</a>` : ''}
          ${paper.weightsUrl ? `<a href="${paper.weightsUrl}" target="_blank" rel="noopener noreferrer" class="action-chip">🤗 Weights</a>` : ''}
          <button class="action-chip copy-bibtex-btn" data-id="${paper.id}">📋 Copy BibTeX</button>
        </div>
      </article>
    `).join('');

    // Bind BibTeX copy triggers
    papersListEl.querySelectorAll('.copy-bibtex-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const paper = papersData.find(p => p.id === btn.dataset.id);
        if (paper) openBibtexModal(paper);
      });
    });
  }

  // Event Listeners for Filters
  trackFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      trackFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTrack = btn.dataset.track;
      renderPapers();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderPapers();
  });

  renderPapers();
}

/* ==========================================================================
   Projects Page Controller
   ========================================================================== */
function initProjectsPage() {
  const projectsGridEl = document.getElementById('projects-grid');
  const searchInput = document.getElementById('projects-search-input');
  const filterPills = document.querySelectorAll('.project-filter-pill');

  let activeCategory = 'all';
  let searchQuery = '';

  function createProjectCard(proj) {
    const isActive = proj.status === 'Active';
    return `
      <div class="project-card" id="${proj.id}">
        <div class="project-card-banner" style="background: ${proj.bannerGradient || 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'};">
          <span class="project-banner-label">${proj.bannerLabel || proj.category}</span>
          ${proj.metrics ? `<span class="project-metrics-badge">⚡ ${proj.metrics}</span>` : ''}
        </div>
        <div class="project-card-body">
          <div class="project-category-row">
            <span class="project-cat-tag">${proj.category}</span>
            <span class="project-status-tag ${isActive ? 'project-status-active' : 'project-status-completed'}">
              ${isActive ? '● ACTIVE' : 'COMPLETED'}
            </span>
          </div>

          <h3 class="project-card-title">${proj.name}</h3>
          <p class="project-tagline">${proj.tagline}</p>
          <p class="project-description">${proj.description}</p>

          <div class="project-tags-wrap">
            ${(proj.tags || []).map(t => `<span class="project-tag-chip">${t}</span>`).join('')}
          </div>

          <div class="project-contributors-row">
            <span>👥</span>
            <span>${proj.contributors.join(', ')}</span>
          </div>

          <div class="project-card-actions">
            <button class="project-details-btn open-proj-modal-btn" data-id="${proj.id}">Details</button>
            ${proj.github ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm project-action-link">GitHub ↗</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderProjects() {
    if (!projectsGridEl) return;

    const filtered = projectsData.filter(proj => {
      const matchesCategory = activeCategory === 'all' || proj.category.toLowerCase() === activeCategory.toLowerCase();
      const content = `${proj.name} ${proj.tagline} ${proj.description} ${(proj.tags || []).join(' ')} ${(proj.contributors || []).join(' ')}`.toLowerCase();
      const matchesSearch = !searchQuery || content.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      projectsGridEl.innerHTML = `
        <div class="event-empty-box" style="grid-column: 1 / -1;">
          <div style="font-size: 2.2rem; margin-bottom: 0.75rem;">⚡</div>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 1.15rem;">No projects match your filter</div>
          <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.35rem;">Try selecting 'All' or searching for different keywords.</div>
        </div>
      `;
      return;
    }

    projectsGridEl.innerHTML = filtered.map(createProjectCard).join('');
    bindProjectModalTriggers(projectsGridEl);
  }

  filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderProjects();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProjects();
  });

  renderProjects();
}

/* ==========================================================================
   Events Page Controller (IEEE CS Style)
   ========================================================================== */
function initEventsPage() {
  const upcomingGridEl = document.getElementById('upcoming-events-grid');
  const pastGridEl = document.getElementById('past-events-grid');
  const searchInput = document.getElementById('events-search-input');
  const filterPills = document.querySelectorAll('.event-filter-pill');
  const featuredCountdownEl = document.getElementById('event-countdown');

  // Featured Event Countdown
  const featuredEvent = eventsData.find(e => e.featured && e.status === 'upcoming') || eventsData[0];
  if (featuredCountdownEl && featuredEvent) {
    const targetDate = new Date(featuredEvent.date).getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('cd-days');
        const hoursEl = document.getElementById('cd-hours');
        const minEl = document.getElementById('cd-minutes');
        const secEl = document.getElementById('cd-seconds');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
        if (secEl) secEl.textContent = String(seconds).padStart(2, '0');
      } else {
        featuredCountdownEl.innerHTML = `<span class="badge badge-emerald">Event is in progress or completed</span>`;
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    document.getElementById('featured-event-ics')?.addEventListener('click', () => {
      downloadIcsFile(featuredEvent);
    });
  }

  let activeType = 'all';
  let searchQuery = '';

  function createEventCard(evt) {
    const isUpcoming = evt.status === 'upcoming';
    return `
      <div class="event-card" id="${evt.id}">
        <div class="event-card-banner" style="background: ${evt.bannerGradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'};">
          <span class="event-card-banner-badge">${evt.bannerLabel || evt.type}</span>
        </div>
        <div class="event-card-body">
          <div class="event-category-status-row">
            <span class="event-cat-tag">${evt.type}</span>
            <span class="event-status-tag ${isUpcoming ? 'event-status-upcoming' : 'event-status-past'}">
              ${isUpcoming ? '● UPCOMING' : 'COMPLETED'}
            </span>
          </div>

          <div class="event-date-block">
            <span class="event-day-number">${evt.day || '01'}</span>
            <span class="event-month-year">${evt.monthYear || evt.displayDate}</span>
          </div>

          <h3 class="event-title">${evt.title}</h3>
          <p class="event-summary">${evt.summary}</p>

          <div class="event-meta-list">
            <div class="event-meta-item">
              <span>🕒</span>
              <span>${evt.time}</span>
            </div>
            <div class="event-meta-item">
              <span>📍</span>
              <span>${evt.location}</span>
            </div>
            <div class="event-meta-item">
              <span>👤</span>
              <span>${evt.speaker.name} (${evt.speaker.affiliation})</span>
            </div>
          </div>

          <div class="event-tags">
            ${(evt.tags || []).map(t => `<span class="event-tag-pill">${t}</span>`).join('')}
          </div>

          <div class="event-card-actions">
            <button class="event-details-btn" data-event-id="${evt.id}">Details</button>
            ${isUpcoming && evt.rsvpUrl 
              ? `<a href="${evt.rsvpUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm event-action-link">RSVP Pass</a>`
              : (!isUpcoming && evt.materials?.notebookUrl 
                  ? `<a href="${evt.materials.notebookUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm event-action-link">Notebook ↗</a>`
                  : (isUpcoming 
                      ? `<button class="btn btn-secondary btn-sm event-action-link ics-btn" data-id="${evt.id}">+ Calendar</button>`
                      : `<button class="btn btn-secondary btn-sm event-action-link recap-btn" data-event-id="${evt.id}">Recap</button>`
                    )
                )
            }
          </div>
        </div>
      </div>
    `;
  }

  function openEventDetails(evt) {
    const isUpcoming = evt.status === 'upcoming';
    const modalContent = `
      <div style="display: flex; flex-direction: column; gap: 1.4rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <span class="badge ${isUpcoming ? 'badge-emerald' : 'badge-amber'}">${evt.type.toUpperCase()} • ${isUpcoming ? 'UPCOMING' : 'COMPLETED'}</span>
          <span style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--gold); font-weight: 600;">📅 ${evt.displayDate} • ${evt.time}</span>
        </div>

        <p style="font-size: 1.05rem; color: var(--text-secondary); line-height: 1.6;">${evt.summary}</p>

        <div style="background: var(--surface-hover); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem;">SPEAKER & FACILITATOR</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${evt.speaker.name}</div>
          <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.2rem;">${evt.speaker.affiliation} — ${evt.speaker.role}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">VENUE & LOCATION</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-top: 0.25rem;">📍 ${evt.location}</div>
          </div>
          <div style="background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">TOPIC TAGS</div>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.4rem;">
              ${(evt.tags || []).map(t => `<span class="event-tag-pill">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        ${evt.materials ? `
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.6rem;">WORKSHOP & LAB ASSETS</div>
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
              ${evt.materials.notebookUrl ? `<a href="${evt.materials.notebookUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">📓 Google Colab Notebook</a>` : ''}
              ${evt.materials.slidesUrl && evt.materials.slidesUrl !== '#' ? `<a href="${evt.materials.slidesUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">📊 Presentation Deck (.PDF)</a>` : ''}
              ${evt.materials.videoUrl ? `<a href="${evt.materials.videoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">🎥 Session Replay Recording</a>` : ''}
            </div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; border-top: 1px solid var(--surface-border); padding-top: 1.25rem;">
          ${isUpcoming && evt.rsvpUrl ? `<a href="${evt.rsvpUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold">Confirm RSVP Attendance →</a>` : ''}
          ${isUpcoming ? `<button class="btn btn-secondary modal-calendar-btn" data-id="${evt.id}">Add to Calendar (.ICS)</button>` : ''}
        </div>
      </div>
    `;

    openModal(evt.title, modalContent);

    document.querySelector('.modal-calendar-btn')?.addEventListener('click', () => {
      downloadIcsFile(evt);
    });
  }

  function bindCardEvents(container) {
    if (!container) return;
    container.querySelectorAll('.event-details-btn, .recap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const evt = eventsData.find(e => e.id === btn.dataset.eventId);
        if (evt) openEventDetails(evt);
      });
    });

    container.querySelectorAll('.ics-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const evt = eventsData.find(e => e.id === btn.dataset.id);
        if (evt) downloadIcsFile(evt);
      });
    });
  }

  function renderEvents() {
    const filtered = eventsData.filter(evt => {
      const matchesType = activeType === 'all' || evt.type.toLowerCase() === activeType.toLowerCase();
      const matchesSearch = !searchQuery || 
        evt.title.toLowerCase().includes(searchQuery) ||
        evt.summary.toLowerCase().includes(searchQuery) ||
        evt.speaker.name.toLowerCase().includes(searchQuery) ||
        evt.location.toLowerCase().includes(searchQuery) ||
        (evt.tags && evt.tags.some(t => t.toLowerCase().includes(searchQuery)));
      return matchesType && matchesSearch;
    });

    const upcomingEvents = filtered.filter(e => e.status === 'upcoming');
    const pastEvents = filtered.filter(e => e.status === 'past');

    if (upcomingGridEl) {
      if (upcomingEvents.length > 0) {
        upcomingGridEl.innerHTML = upcomingEvents.map(createEventCard).join('');
        bindCardEvents(upcomingGridEl);
      } else {
        upcomingGridEl.innerHTML = `
          <div class="event-empty-box">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">📅</div>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1rem;">No upcoming events found</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">Try clearing your search or selecting a different category.</div>
          </div>
        `;
      }
    }

    if (pastGridEl) {
      if (pastEvents.length > 0) {
        pastGridEl.innerHTML = pastEvents.map(createEventCard).join('');
        bindCardEvents(pastGridEl);
      } else {
        pastGridEl.innerHTML = `
          <div class="event-empty-box">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">🏛</div>
            <div style="font-weight: 600; color: var(--text-primary); font-size: 1.1rem;">No archived events match filter</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">Check out all categories for archived recordings.</div>
          </div>
        `;
      }
    }
  }

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderEvents();
  });

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeType = pill.dataset.type;
      renderEvents();
    });
  });

  renderEvents();
}

/* ==========================================================================
   Members Page Controller (IEEE CS MITS Office Bearers Style)
   ========================================================================== */
function initMembersPage() {
  // 1. Faculty Mentor
  const mentorContainer = document.getElementById('faculty-mentor-container');
  if (mentorContainer && membersData.facultyMentor) {
    const mentor = membersData.facultyMentor;
    mentorContainer.innerHTML = `
      <div class="faculty-mentor-card">
        <div class="faculty-avatar-box">${mentor.avatarText}</div>
        <div class="faculty-details">
          <div class="faculty-badge">${mentor.role}</div>
          <h3 class="faculty-name">${mentor.name}</h3>
          <div class="faculty-title-text">${mentor.title}</div>
          <div class="faculty-dept-text">${mentor.department}</div>
          <div class="faculty-email-text">✉ ${mentor.email}</div>
          <div class="faculty-actions">
            ${mentor.profileUrl ? `<a href="${mentor.profileUrl}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">Faculty profile ↗</a>` : ''}
            ${mentor.linkedin ? `<a href="${mentor.linkedin}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">LinkedIn</a>` : ''}
            ${mentor.scholar ? `<a href="${mentor.scholar}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">Scholar</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 2. Core Office Bearers: President / Chair Card
  const chairContainer = document.getElementById('chair-featured-container');
  if (chairContainer && membersData.president) {
    const chair = membersData.president;
    chairContainer.innerHTML = `
      <div class="chair-featured-card">
        <div class="chair-avatar-circle">${chair.avatarText}</div>
        <div>
          <div class="chair-badge">${chair.badge}</div>
          <h3 class="chair-name">${chair.name}</h3>
          <div class="chair-designation">${chair.designation}</div>
          <p class="chair-bio">${chair.bio}</p>
          <div style="display: flex; gap: 0.6rem;">
            ${chair.linkedin ? `<a href="${chair.linkedin}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">LinkedIn</a>` : ''}
            ${chair.github ? `<a href="${chair.github}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">GitHub</a>` : ''}
            ${chair.scholar ? `<a href="${chair.scholar}" target="_blank" rel="noopener noreferrer" class="faculty-link-chip">Scholar</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 3. 4-Column Core Officers Grid
  const officersContainer = document.getElementById('core-officers-grid');
  if (officersContainer && membersData.coreOfficers) {
    officersContainer.innerHTML = membersData.coreOfficers.map(officer => `
      <div class="core-officer-card">
        <div class="officer-avatar-circle">${officer.avatarText}</div>
        <h4 class="officer-name">${officer.name}</h4>
        <div class="officer-designation">${officer.designation}</div>
        <div class="officer-major">${officer.major}</div>
        <div class="officer-socials">
          ${officer.github ? `<a href="${officer.github}" target="_blank" rel="noopener noreferrer" class="officer-social-btn" aria-label="GitHub">GH</a>` : ''}
          ${officer.linkedin ? `<a href="${officer.linkedin}" target="_blank" rel="noopener noreferrer" class="officer-social-btn" aria-label="LinkedIn">IN</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // 4. Specialised Divisions
  const divisionsContainer = document.getElementById('divisions-container');
  const divisionFilters = document.querySelectorAll('.div-filter-btn');

  function renderDivisions(filterId = 'all') {
    if (!divisionsContainer || !membersData.divisions) return;

    const filtered = filterId === 'all'
      ? membersData.divisions
      : membersData.divisions.filter(d => d.id === filterId);

    divisionsContainer.innerHTML = filtered.map(div => `
      <div class="division-group-box" id="div-${div.id}">
        <div class="division-header-row">
          <div class="division-title-left">
            <span class="division-accent-bar"></span>
            <h3 class="division-title">${div.name}</h3>
          </div>
          <span class="division-count-badge">${div.members.length} members</span>
        </div>
        <div class="division-members-grid">
          ${div.members.map(m => `
            <div class="div-member-card">
              <div class="div-member-avatar">${m.avatarText}</div>
              <div>
                <div class="div-member-name">${m.name}</div>
                <div class="div-member-major">${m.major}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  divisionFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      divisionFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDivisions(btn.dataset.div);
    });
  });

  renderDivisions('all');

  // 5. Alumni Wall
  const alumniContainer = document.getElementById('members-alumni-grid');
  if (alumniContainer && membersData.alumni) {
    alumniContainer.innerHTML = membersData.alumni.map(alumnus => `
      <div class="alumni-card">
        <div class="alumni-destination">🏛 ${alumnus.destination}</div>
        <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">${alumnus.name}</div>
        <div style="font-size: 0.88rem; color: var(--gold);">${alumnus.currentPosition}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.35rem;">
          ${alumnus.pastRole} • ${alumnus.classYear}
        </div>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   Join & Recruitment Page Controller
   ========================================================================== */
function initJoinPage() {
  const faqContainer = document.getElementById('faq-accordion');
  if (faqContainer) {
    faqContainer.innerHTML = faqsData.map((faq, index) => `
      <div class="accordion-item" id="faq-item-${index}">
        <button class="accordion-trigger" aria-expanded="false">
          <span>${faq.q}</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>${faq.a}</p>
        </div>
      </div>
    `).join('');

    faqContainer.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.parentElement;
        const isOpen = item.classList.toggle('open');
        trigger.setAttribute('aria-expanded', isOpen);
      });
    });
  }
}

/* ==========================================================================
   Shared Modal Helpers
   ========================================================================== */
function openBibtexModal(paper) {
  const modalContent = `
    <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">
      Use this BibTeX entry to cite this paper in your academic publications and LaTeX manuscripts:
    </p>
    <div class="bibtex-code-box" id="bibtex-content">${escapeHtml(paper.bibtex)}</div>
    <div style="display: flex; gap: 1rem; justify-content: flex-end;">
      <button class="btn btn-secondary btn-sm" id="modal-copy-btn">📋 Copy Citation</button>
      <button class="btn btn-ghost btn-sm" id="modal-close-action">Close</button>
    </div>
  `;

  openModal(`BibTeX: ${paper.title.slice(0, 40)}...`, modalContent);

  document.getElementById('modal-copy-btn')?.addEventListener('click', () => {
    copyToClipboard(paper.bibtex, 'BibTeX citation copied to clipboard!');
  });

  document.getElementById('modal-close-action')?.addEventListener('click', closeModal);
}

function bindProjectModalTriggers(container) {
  container.querySelectorAll('.open-proj-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = projectsData.find(p => p.id === btn.dataset.id);
      if (!proj) return;

      const detailsHtml = `
        <div style="display: flex; flex-direction: column; gap: 1.4rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <span class="badge ${proj.status === 'Active' ? 'badge-emerald' : 'badge-amber'}">${proj.category.toUpperCase()} • ${proj.status.toUpperCase()}</span>
              ${proj.metrics ? `<span class="project-metrics-badge" style="font-size: 0.75rem;">⚡ ${proj.metrics}</span>` : ''}
            </div>
            <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--gold); font-weight: 600;">MLRC Open-Source Artifact</span>
          </div>

          <div>
            <h4 style="font-size: 1.3rem; color: var(--text-primary); margin-bottom: 0.35rem; font-weight: 700;">${proj.tagline}</h4>
            <p style="color: var(--text-secondary); font-size: 0.98rem; line-height: 1.6;">${proj.description}</p>
          </div>

          <div style="background: var(--surface-hover); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem;">MOTIVATION & PROBLEM STATEMENT</div>
            <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1rem;">${proj.details.motivation}</p>
            
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem;">KEY ARCHITECTURE & METHOD</div>
            <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1rem;">${proj.details.architecture}</p>
            
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4rem;">QUANTITATIVE BENCHMARKS</div>
            <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6;">${proj.details.results}</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div style="background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem;">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">CONTRIBUTORS</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-top: 0.25rem;">👥 ${proj.contributors.join(', ')}</div>
            </div>
            <div style="background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem;">
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono);">TECH STACK</div>
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.4rem;">
                ${(proj.tags || []).map(t => `<span class="project-tag-chip">${t}</span>`).join('')}
              </div>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--surface-border); border-radius: var(--radius-md); padding: 1rem;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 0.4rem;">QUICKSTART INSTALLATION</div>
            <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--gold); background: #000; padding: 0.6rem 0.85rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; overflow-x: auto;">
              <span>git clone ${proj.github} && cd ${proj.name.toLowerCase()}</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; border-top: 1px solid var(--surface-border); padding-top: 1.25rem; flex-wrap: wrap;">
            ${proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">🚀 Live Demo</a>` : ''}
            ${proj.github ? `<a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-sm">💻 GitHub Repository</a>` : ''}
            <button class="btn btn-secondary btn-sm" id="modal-proj-close">Close</button>
          </div>
        </div>
      `;

      openModal(`Project: ${proj.name}`, detailsHtml);
      document.getElementById('modal-proj-close')?.addEventListener('click', closeModal);
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
