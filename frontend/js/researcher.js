async function loadResearcherCards(query = '') {
  const container = document.getElementById('research-card-container');
  if (!container) return;

  try {
    const local = JSON.parse(localStorage.getItem('bd_research_findings') || '[]');
    const remote = await fetchJson('/api/research/findings', './data/research_findings.json');
    const list = [...local, ...remote];
    const filtered = query ? list.filter(item => {
      const q = query.toLowerCase();
      return [item.title, item.author, item.institution, item.finding_statement, item.policy_implications].join(' ').toLowerCase().includes(q);
    }) : list;

    if (filtered.length === 0) {
      container.innerHTML = '<p style="color:#6b7280; font-size:12px; padding:10px;">No matching research papers found. Try another search term.</p>';
      return;
    }

    container.innerHTML = filtered.slice(0, 3).map(item => `
      <div class="clean-res-card">
        <div class="clean-res-title">📄 ${item.title}</div>
        <div class="clean-res-author">By ${item.author} (${item.publication_year}) • ${item.institution}</div>
        <div class="clean-res-finding"><strong>Key Evidence:</strong> "${item.finding_statement}"</div>
        <div style="font-size:11px; color:#6b7280; margin-top:2px;"><strong>Actionable Policy Takeaway:</strong> ${item.policy_implications}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load research papers:', err);
    container.innerHTML = '<p style="color:#6b7280; font-size:12px; padding:10px;">Research data could not be loaded. Please refresh the page.</p>';
  }
}

function doSearchResearch() {
  const q = document.getElementById('research-search-box').value.trim();
  showToast(q ? `Searching evidence for: "${q}"...` : 'Showing all evidence...');
  loadResearcherCards(q);
}

function openPublishModal() {
  const el = document.getElementById('pub-title');
  if (el) el.focus();
  showToast('Fill in the quick publish form on the right.');
}

async function handleQuickPublish(e) {
  e.preventDefault();

  const payload = {
    title: document.getElementById('pub-title').value.trim(),
    finding_statement: document.getElementById('pub-statement').value.trim(),
    author: document.getElementById('pub-author').value.trim(),
    institution: 'Indian Academic Network',
    geography: 'Malaprabha Basin, Karnataka',
    methodology: 'In-situ hydraulic monitoring and satellite validation',
    dataset_used: 'Bhuvan LULC & Ground Water Board',
    publication_year: 2026,
    policy_implications: document.getElementById('pub-policy').value.trim(),
    limitations: 'Parcel level survey recommended.'
  };

  try {
    const res = await fetch('/api/research/findings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('✓ Research published! Now discoverable by government policymakers.');
      document.getElementById('simple-publish-form').reset();
      loadResearcherCards();
      return;
    }
  } catch (err) {
    console.warn('Backend unavailable; storing locally:', err);
  }

  const existing = JSON.parse(localStorage.getItem('bd_research_findings') || '[]');
  existing.unshift(payload);
  localStorage.setItem('bd_research_findings', JSON.stringify(existing));
  showToast('✓ Research saved locally on this browser for GitHub Pages.');
  document.getElementById('simple-publish-form').reset();
  loadResearcherCards();
}
