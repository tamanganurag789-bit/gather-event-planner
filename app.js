(() => {
  const $ = (selector) => document.querySelector(selector);
  const defaults = {
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
  const asText = (value, fallback = '') => typeof value === 'string' ? value : fallback;
  const asAmount = (value, fallback = 0) => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback;
  function readPlan() {
    try {
      const saved = JSON.parse(localStorage.getItem('gather-plan') || 'null');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...defaults };
      return {
        ...defaults, ...saved,
        title: asText(saved.title, defaults.title), place: asText(saved.place, defaults.place),
        type: asText(saved.type, defaults.type), date: saved.date === '' ? '' : typeof saved.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(saved.date) ? saved.date : defaults.date,
        total: asAmount(saved.total, defaults.total), spent: asAmount(saved.spent, defaults.spent),
        done: Math.max(0, Math.floor(asAmount(saved.done, defaults.done))),
        timeline: Array.isArray(saved.timeline) ? saved.timeline.filter(item => item && typeof item === 'object').map(item => ({
          date: asText(item.date, 'SOON'), title: asText(item.title, 'Untitled milestone'), note: asText(item.note),
          status: item.status === 'DONE' ? 'DONE' : item.status === 'IN PROGRESS' ? 'IN PROGRESS' : 'UP NEXT'
        })) : defaults.timeline.map(item => ({ ...item })),
        vendors: Array.isArray(saved.vendors) ? saved.vendors.filter(item => item && typeof item === 'object').map(item => ({
          icon: asText(item.icon, '✿'), name: asText(item.name, 'Vendor'), detail: asText(item.detail), status: item.status === 'booked' ? 'booked' : 'pending'
        })) : defaults.vendors.map(item => ({ ...item }))
      };
    } catch {
      return { ...defaults };
    }
  }
  const state = readPlan();
  const save = () => { try { localStorage.setItem('gather-plan', JSON.stringify(state)); } catch { toast('Could not save on this device. Check your browser storage settings.'); } };
  const moneyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const money = (n) => moneyFormatter.format(asAmount(n));
  const fmtDate = (date) => date ? dateFormatter.format(new Date(`${date}T12:00:00`)).toUpperCase() : 'ADD A DATE';
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
    $('#timelineList').innerHTML = state.timeline.map((item, index) => `<div class="timeline-row"><span class="timeline-date">${escapeHtml(item.date)}</span><div class="timeline-info"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.note)}</p></div><button type="button" class="timeline-status ${item.status === 'UP NEXT' ? 'upcoming' : item.status === 'DONE' ? 'done' : ''}" data-milestone="${index}" aria-label="${item.status === 'DONE' ? 'Reopen' : 'Complete'} milestone: ${escapeHtml(item.title)}">${escapeHtml(item.status)}</button></div>`).join('');
    $('#vendorGrid').innerHTML = state.vendors.map((v, i) => `<article class="vendor-card ${v.status === 'pending' ? 'pending' : ''}" data-vendor="${i}" tabindex="0" role="button" aria-label="${escapeHtml(v.name)}: ${v.status === 'pending' ? 'mark booked' : 'edit vendor'}"><span class="vendor-icon">${escapeHtml(v.icon || '✿')}</span><div class="vendor-copy"><strong>${escapeHtml(v.name)}</strong><span>${escapeHtml(v.detail)}</span></div></article>`).join('');
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
  $('#newPlanBtn').addEventListener('click', () => openModal('Plan a new event', 'A LITTLE SOMETHING TO CELEBRATE', `<label>What are we celebrating?<select name="type"><option>Wedding</option><option>Birthday</option><option>Community gathering</option><option>Baby shower</option><option>Something else</option></select></label><label>Give it a name<input name="title" placeholder="e.g. Sam’s 30th birthday" required></label><label>When’s the big day?<input type="date" name="date"></label><label>Where will it be?<input name="place" placeholder="Add a venue or neighborhood"></label><label>What’s your budget?<input type="number" name="total" min="0" placeholder="5000"></label>`, d => { state.title = d.title.trim(); state.type = d.type; state.date = d.date; state.place = d.place.trim(); state.total = asAmount(d.total, state.total); state.spent = 0; state.done = 0; state.timeline = [ { date: 'SOON', title: 'Confirm the guest list', note: 'A headcount helps you choose the space and food.', status: 'IN PROGRESS' }, { date: 'NEXT', title: 'Choose a venue or gathering space', note: 'Check capacity, access, and what is included.', status: 'UP NEXT' }, { date: 'BEFORE THE DAY', title: 'Confirm food and the day-of plan', note: 'Share timing and responsibilities with helpers.', status: 'UP NEXT' } ]; state.vendors = [ { icon: '⌂', name: 'Venue / space', detail: 'Find a place that fits your guests', status: 'pending' }, { icon: '✿', name: 'Food & refreshments', detail: 'Plan the menu and dietary options', status: 'pending' }, { icon: '♫', name: 'Music & activities', detail: 'Choose the soundtrack or activity', status: 'pending' }, { icon: '◌', name: 'Photos & memories', detail: 'Decide how to capture the day', status: 'pending' } ]; save(); render(); toast('Your new celebration is ready for the good stuff.'); return true; }));
  $('#editEventBtn').addEventListener('click', () => openModal('A few little details', 'YOUR EVENT, YOUR WAY', `<label>Event name<input name="title" value="${escapeHtml(state.title)}" required></label><label>Event type<select name="type">${['Wedding','Birthday','Community gathering','Baby shower','Something else'].map(x => `<option ${state.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Location<input name="place" value="${escapeHtml(state.place)}"></label><label>Date<input type="date" name="date" value="${escapeHtml(state.date)}"></label><label>Total budget<input type="number" name="total" min="0" value="${state.total}"></label>`, d => { Object.assign(state, { title: d.title.trim(), type: d.type, place: d.place.trim(), date: d.date, total: asAmount(d.total, state.total) }); save(); render(); toast('Details updated — looking good.'); return true; }));
  $('#budgetBtn').addEventListener('click', () => openModal('A budget that feels good', 'LET’S SEE WHERE IT’S GOING', `<label>Total budget<input name="total" type="number" min="0" value="${state.total}" required></label><label>Amount spent so far<input name="spent" type="number" min="0" value="${state.spent}" required></label>`, d => { state.total = asAmount(d.total); state.spent = asAmount(d.spent); save(); render(); toast(`You’ve got ${money(Math.max(0, state.total - state.spent))} left to make magic.`); return true; }));
  $('#addTimelineBtn').addEventListener('click', () => openModal('Add a milestone', 'ONE THING AT A TIME', `<label>What needs doing?<input name="title" placeholder="e.g. Finalise the guest list" required></label><label>A little note<input name="note" placeholder="Anything else to remember?"></label><label>When?<input name="date" type="date"></label>`, d => { const date = d.date ? new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'SOON'; state.timeline.push({ date, title: d.title, note: d.note || 'A little milestone on the way.', status: 'UP NEXT' }); save(); render(); toast('A new little milestone is on the timeline.'); return true; }));
  $('#timelineList').addEventListener('click', e => { const button = e.target.closest('[data-milestone]'); if (!button) return; const item = state.timeline[Number(button.dataset.milestone)]; if (!item) return; item.status = item.status === 'DONE' ? 'UP NEXT' : 'DONE'; state.done = Math.max(0, state.done + (item.status === 'DONE' ? 1 : -1)); save(); render(); toast(item.status === 'DONE' ? 'Milestone checked off — one less thing to think about.' : 'Milestone moved back to your list.'); });
  $('#timelineBtn').addEventListener('click', () => { document.querySelector('.timeline-panel').scrollIntoView({ behavior: 'smooth' }); toast('Your milestones are all in one place.'); });
  $('#checklistBtn').addEventListener('click', () => { location.hash = 'checklist'; document.querySelector('#checklist').scrollIntoView({ behavior: 'smooth' }); });
  $('#ideasBtn').addEventListener('click', () => { location.hash = 'ideas'; $('#assistantPrompt').focus(); });
  $('#shareBtn').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('App link copied. Your plan is saved on this device.'); } catch { toast('Your plan is saved on this device.'); } });
  $('#eventMenu').addEventListener('click', () => openModal('A few little details', 'YOUR EVENT, YOUR WAY', `<label>Event name<input name="title" value="${escapeHtml(state.title)}" required></label><label>Location<input name="place" value="${escapeHtml(state.place)}"></label>`, d => { state.title = d.title; state.place = d.place; save(); render(); toast('Details updated.'); return true; }));
  $('#vendorAddBtn').addEventListener('click', () => openModal('Find your people', 'ADD TO THE VENDOR LIST', `<label>Vendor type<select name="name">${Object.keys(iconMap).map(k => `<option>${k}</option>`).join('')}</select></label><label>Vendor or little reminder<input name="detail" placeholder="e.g. Ask about seasonal flowers"></label>`, d => { const existing = state.vendors.find(v => v.name === d.name); if (existing) existing.detail = d.detail || 'A little detail to follow'; else state.vendors.push({ icon: iconMap[d.name], name: d.name, detail: d.detail || 'Find your person', status: 'pending' }); save(); render(); toast(`${d.name} added to your checklist.`); return true; }));
  $('#vendorGrid').addEventListener('click', (e) => { const card = e.target.closest('.vendor-card'); if (!card) return; const v = state.vendors[Number(card.dataset.vendor)]; if (v.status === 'pending') { v.status = 'booked'; v.detail = v.detail.includes('Find') ? 'Booked · you’ve got this' : `Booked · ${v.detail}`; state.done = Math.min(12, state.done + 1); save(); render(); toast(`${v.name} is on board — lovely choice.`); } else openModal('A vendor detail', 'GOOD PEOPLE, GOOD PLANS', `<label>${escapeHtml(v.name)}<input name="detail" value="${escapeHtml(v.detail)}"></label>`, d => { v.detail = d.detail; save(); render(); toast('Vendor details saved.'); return true; }); });
  $('#vendorGrid').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const card = e.target.closest('.vendor-card'); if (card) { e.preventDefault(); card.click(); } } });
  document.querySelectorAll('.suggestion-chips button').forEach(button => button.addEventListener('click', () => { $('#assistantPrompt').value = button.textContent === 'Budget-friendly ideas' ? 'Give me a few budget-friendly ideas for our day' : 'How can we make our guests feel extra special?'; $('#assistantPrompt').focus(); }));
  $('#assistantForm').addEventListener('submit', e => { e.preventDefault(); const prompt = $('#assistantPrompt').value.trim(); if (!prompt) { $('#assistantPrompt').focus(); return; } const lower = prompt.toLowerCase(); const kind = state.type.toLowerCase(); const remaining = Math.max(0, state.total - state.spent); let reply;
    if (/budget|cheap|save|afford|cost/.test(lower)) reply = `For your ${kind}, you have ${money(remaining)} remaining from a ${money(state.total)} budget. Protect the essentials first: venue/space, food, and any accessibility needs. Then choose one memorable splurge and simplify the rest. ${remaining === 0 ? 'Your planned budget is fully allocated, so review the spend before adding anything.' : `A practical next step is to reserve 10% (${money(remaining * 0.1)}) of what remains for last-minute costs.`}`;
    else if (/food|serve|menu|eat|drink/.test(lower)) reply = kind === 'birthday' ? `For a birthday, make serving easy: a cake or dessert table, a few crowd-pleasing snacks, and clearly labelled non-alcoholic drinks. Ask guests about dietary needs when they RSVP, then order for your confirmed headcount.` : kind === 'community gathering' ? `For a community gathering, plan a simple potluck or affordable shared menu. Label ingredients, provide water and non-alcoholic drinks, and ask volunteers to cover setup and cleanup.` : `For your ${kind}, offer a seasonal menu with a vegetarian option, clearly labelled allergens, and a non-alcoholic drink. Confirm the headcount and dietary needs before finalizing quantities.`;
    else if (/guest|experience|people|fun|activity/.test(lower)) reply = kind === 'birthday' ? `For a birthday, pick one easy activity that suits the guest of honor—trivia, a shared playlist, or a photo corner. Keep a quieter seating spot available and give guests a clear start time and address.` : kind === 'community gathering' ? `For a community gathering, make arrivals welcoming with clear signs, name tags, and a greeter. Offer a low-pressure activity people can join at any time, plus seating and an accessible route through the space.` : `For your ${kind}, welcome guests with clear arrival details, a comfortable seating area, and one relaxed activity that helps people mingle. Share a photo album link afterward so guests can contribute memories.`;
    else if (/theme|vibe|idea|decor|flower/.test(lower)) reply = kind === 'birthday' ? `For a birthday theme, start with the guest of honor’s favourite colour, music, or hobby. Use a small number of reusable decorations, then spend the time on one personal detail such as a memory board or custom playlist.` : kind === 'community gathering' ? `For a community gathering, let the place guide the look: simple reusable signs, local flowers or greenery, and a shared display where people can add notes or photos. Keep pathways clear and decorations easy to take down.` : `For your ${kind}, choose two or three colours and build around seasonal flowers or greenery. Add candlelight or warm lighting, a playlist that changes with the evening, and one handmade detail that tells your story.`;
    else reply = `For your ${kind}${state.date ? ` on ${fmtDate(state.date)}` : ''}${state.place ? ` at ${state.place}` : ''}, start with the next decision that unlocks the others: confirm the guest count, then match the space and food to it. You have ${money(remaining)} remaining. What matters most: atmosphere, food, or making guests feel welcome?`;
    $('#assistantResponse').textContent = reply; $('#assistantResponse').classList.add('visible'); $('#assistantPrompt').value = ''; });
  render();
})();
