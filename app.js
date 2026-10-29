(() => {
  const $ = (selector) => document.querySelector(selector);
  const state = JSON.parse(localStorage.getItem('gather-plan') || 'null') || {
    title: 'Maya & Arjun’s Wedding', place: 'The Fig House, Los Angeles', date: '2027-06-12', type: 'Wedding', total: 25000, spent: 12450,
    done: 8, timeline: [
      { date: 'OCT 01', title: 'Book your dream photographer', note: 'You’ll want the good light and the happy tears.', status: 'IN PROGRESS' },
      { date: 'OCT 15', title: 'Send save-the-dates', note: 'A little something lovely in everyone’s mailbox.', status: 'UP NEXT' },
      { date: 'NOV 02', title: 'Choose your ceremony music', note: 'Cue the feelings (and maybe the happy dancing).', status: 'UP NEXT' }
    ], vendors: [
      { icon: '✿', name: 'Venue & catering', detail: 'The Fig House · booked', status: 'booked' },
      { icon: '◌', name: 'Photographer', detail: 'Find your person', status: 'pending' },
      { icon: '♫', name: 'Music & DJ', detail: 'A good dancefloor is a must', status: 'pending' },
      { icon: '❀', name: 'Flowers', detail: 'Seasonal & in bloom', status: 'pending' }
    ]
  };
  const save = () => localStorage.setItem('gather-plan', JSON.stringify(state));
  const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
  const fmtDate = (date) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'ADD A DATE';
  const iconMap = { 'Venue & catering': '✿', Photographer: '◌', 'Music & DJ': '♫', Flowers: '❀', Rentals: '⌂', 'Cake & dessert': '♧', 'Hair & makeup': '✧', Officiant: '♡' };

  function render() {
    $('#eventTitle').textContent = state.title;
    $('.event-type').innerHTML = `<span class="type-icon">♡</span> &nbsp; ${escapeHtml(state.type).toUpperCase()}`;
    $('.event-place').textContent = `⌖  ${state.place}`;
    $('#eventDate').textContent = fmtDate(state.date);
    const days = state.date ? Math.ceil((new Date(`${state.date}T12:00:00`) - new Date(new Date().toDateString())) / 86400000) : null;
    $('#countdownDays').textContent = days === null ? '—' : Math.max(0, days);
    $('.countdown span').innerHTML = days === null ? 'until you add<br>a date' : days === 0 ? 'the big day<br>is here!' : days < 0 ? 'celebrated<br>with love' : 'days of<br>happy anticipation';
    $('#spentAmount').textContent = money(state.spent);
    $('#totalAmount').textContent = money(state.total);
    $('#budgetProgress').style.width = `${Math.min(100, state.spent / Math.max(state.total, 1) * 100)}%`;
    $('.stat-foot').innerHTML = `<span><i class="legend-dot"></i> ${money(state.spent)} spent</span><span><i class="legend-dot muted-dot"></i> ${money(Math.max(0, state.total - state.spent))} left</span>`;
    $('#taskCount').textContent = state.done;
    $('#timelineList').innerHTML = state.timeline.map(item => `<div class="timeline-row"><span class="timeline-date">${item.date}</span><div class="timeline-info"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.note)}</p></div><span class="timeline-status ${item.status === 'UP NEXT' ? 'upcoming' : item.status === 'DONE' ? 'done' : ''}">${item.status}</span></div>`).join('');
    $('#vendorGrid').innerHTML = state.vendors.map((v, i) => `<article class="vendor-card ${v.status === 'pending' ? 'pending' : ''}" data-vendor="${i}" tabindex="0" role="button" aria-label="${escapeHtml(v.name)}: ${v.status === 'pending' ? 'mark booked' : 'edit vendor'}"><span class="vendor-icon">${v.icon || '✿'}</span><div class="vendor-copy"><strong>${escapeHtml(v.name)}</strong><span>${escapeHtml(v.detail)}</span></div></article>`).join('');
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  let toastTimer;
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600); }
  const modal = $('#modal');
  function openModal(title, kicker, fields, onSave) {
    $('#modalTitle').textContent = title; $('#modalKicker').textContent = kicker; $('#modalFields').innerHTML = `<div class="field-grid">${fields}</div>`;
    modal.showModal();
    $('#modalForm').onsubmit = (event) => { if (event.submitter?.value === 'cancel') return; event.preventDefault(); const data = Object.fromEntries(new FormData($('#modalForm')).entries()); if (onSave(data)) modal.close(); };
  }
  $('#newPlanBtn').addEventListener('click', () => openModal('Plan a new event', 'A LITTLE SOMETHING TO CELEBRATE', `<label>What are we celebrating?<select name="type"><option>Wedding</option><option>Birthday</option><option>Community gathering</option><option>Baby shower</option><option>Something else</option></select></label><label>Give it a name<input name="title" placeholder="e.g. Sam’s 30th birthday" required></label><label>When’s the big day?<input type="date" name="date"></label><label>What’s your budget?<input type="number" name="total" min="0" placeholder="5000"></label>`, d => { state.title = d.title; state.type = d.type; state.date = d.date; state.total = Number(d.total) || state.total; state.spent = 0; save(); render(); toast('Your new celebration is ready for the good stuff.'); return true; }));
  $('#editEventBtn').addEventListener('click', () => openModal('A few little details', 'YOUR EVENT, YOUR WAY', `<label>Event name<input name="title" value="${escapeHtml(state.title)}" required></label><label>Event type<select name="type">${['Wedding','Birthday','Community gathering','Baby shower','Something else'].map(x => `<option ${state.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Location<input name="place" value="${escapeHtml(state.place)}"></label><label>Date<input type="date" name="date" value="${state.date}"></label><label>Total budget<input type="number" name="total" min="0" value="${state.total}"></label>`, d => { Object.assign(state, { title: d.title, type: d.type, place: d.place, date: d.date, total: Number(d.total) || state.total }); save(); render(); toast('Details updated — looking good.'); return true; }));
  $('#budgetBtn').addEventListener('click', () => openModal('A budget that feels good', 'LET’S SEE WHERE IT’S GOING', `<label>Total budget<input name="total" type="number" min="0" value="${state.total}" required></label><label>Amount spent so far<input name="spent" type="number" min="0" value="${state.spent}" required></label>`, d => { state.total = Number(d.total); state.spent = Number(d.spent); save(); render(); toast(`You’ve got ${money(Math.max(0, state.total - state.spent))} left to make magic.`); return true; }));
  $('#addTimelineBtn').addEventListener('click', () => openModal('Add a milestone', 'ONE THING AT A TIME', `<label>What needs doing?<input name="title" placeholder="e.g. Finalise the guest list" required></label><label>A little note<input name="note" placeholder="Anything else to remember?"></label><label>When?<input name="date" type="date"></label>`, d => { const date = d.date ? new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'SOON'; state.timeline.push({ date, title: d.title, note: d.note || 'A little milestone on the way.', status: 'UP NEXT' }); save(); render(); toast('A new little milestone is on the timeline.'); return true; }));
  $('#timelineBtn').addEventListener('click', () => { document.querySelector('.timeline-panel').scrollIntoView({ behavior: 'smooth' }); toast('Your milestones are all in one place.'); });
  $('#checklistBtn').addEventListener('click', () => { location.hash = 'checklist'; document.querySelector('#checklist').scrollIntoView({ behavior: 'smooth' }); });
  $('#ideasBtn').addEventListener('click', () => { location.hash = 'ideas'; $('#assistantPrompt').focus(); });
  $('#shareBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('App link copied. Your plan is saved on this device.'); } catch { toast('Your plan is saved on this device.'); } });
  $('#eventMenu').addEventListener('click', () => openModal('A few little details', 'YOUR EVENT, YOUR WAY', `<label>Event name<input name="title" value="${escapeHtml(state.title)}" required></label><label>Location<input name="place" value="${escapeHtml(state.place)}"></label>`, d => { state.title = d.title; state.place = d.place; save(); render(); toast('Details updated.'); return true; }));
  $('#vendorAddBtn').addEventListener('click', () => openModal('Find your people', 'ADD TO THE VENDOR LIST', `<label>Vendor type<select name="name">${Object.keys(iconMap).map(k => `<option>${k}</option>`).join('')}</select></label><label>Vendor or little reminder<input name="detail" placeholder="e.g. Ask about seasonal flowers"></label>`, d => { const existing = state.vendors.find(v => v.name === d.name); if (existing) existing.detail = d.detail || 'A little detail to follow'; else state.vendors.push({ icon: iconMap[d.name], name: d.name, detail: d.detail || 'Find your person', status: 'pending' }); save(); render(); toast(`${d.name} added to your checklist.`); return true; }));
  $('#vendorGrid').addEventListener('click', (e) => { const card = e.target.closest('.vendor-card'); if (!card) return; const v = state.vendors[Number(card.dataset.vendor)]; if (v.status === 'pending') { v.status = 'booked'; v.detail = v.detail.includes('Find') ? 'Booked · you’ve got this' : `Booked · ${v.detail}`; state.done = Math.min(12, state.done + 1); save(); render(); toast(`${v.name} is on board — lovely choice.`); } else openModal('A vendor detail', 'GOOD PEOPLE, GOOD PLANS', `<label>${escapeHtml(v.name)}<input name="detail" value="${escapeHtml(v.detail)}"></label>`, d => { v.detail = d.detail; save(); render(); toast('Vendor details saved.'); return true; }); });
  $('#vendorGrid').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const card = e.target.closest('.vendor-card'); if (card) { e.preventDefault(); card.click(); } } });
  document.querySelectorAll('.suggestion-chips button').forEach(button => button.addEventListener('click', () => { $('#assistantPrompt').value = button.textContent === 'Budget-friendly ideas' ? 'Give me a few budget-friendly ideas for our day' : 'How can we make our guests feel extra special?'; $('#assistantPrompt').focus(); }));
  $('#assistantForm').addEventListener('submit', e => { e.preventDefault(); const prompt = $('#assistantPrompt').value.trim(); if (!prompt) { $('#assistantPrompt').focus(); return; } const lower = prompt.toLowerCase(); let reply;
    if (/budget|cheap|save|afford/.test(lower)) reply = `For a ${state.type.toLowerCase()} with a ${money(state.total)} budget, try making one memorable moment your splurge and keeping the rest beautifully simple: choose seasonal flowers, serve a family-style meal, and swap paper extras for a single lovely digital invite. You’ve got ${money(Math.max(0, state.total-state.spent))} left to play with. Want to set aside a specific amount for anything?`;
    else if (/food|serve|menu|eat|drink/.test(lower)) reply = `For your ${state.type.toLowerCase()}, give guests something that feels like you: a seasonal, family-style spread, one wonderful signature drink (with a zero-proof twin), and a little late-night bite. For a garden-party feel, think fresh stone fruit, herbs, and a cake with flowers from the same palette.`;
    else if (/guest|experience|people|fun|activity/.test(lower)) reply = `A few guest-first touches for your ${state.type.toLowerCase()}: a welcome drink the moment people arrive, handwritten place cards with a little personal detail, and one relaxed activity that gives people an excuse to mingle. A shared photo album link near the exit keeps the good memories coming after the day.`;
    else if (/theme|vibe|idea|decor|flower/.test(lower)) reply = `Your golden-hour garden-party vibe is already a lovely starting point. Keep it feeling warm and unfussy with seasonal greenery, candlelight in the evening, a playlist that starts mellow and gets people dancing, and one little handmade detail that tells your story. Pick two or three colours and let everything else breathe.`;
    else reply = `Such a lovely thing to think about. For your ${state.type.toLowerCase()}, start with one detail that feels unmistakably yours, then keep the next steps small: make a short list, pick the one decision that will make everything else easier, and give yourself room to enjoy the day as it comes together. What matters most to you: atmosphere, food, or making guests feel welcome?`;
    $('#assistantResponse').textContent = reply; $('#assistantResponse').classList.add('visible'); $('#assistantPrompt').value = ''; });
  render();
})();
