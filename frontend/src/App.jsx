import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Brain, Check,
  ChevronDown, ChevronRight, CircleHelp, Command, File, FileCode2, FileText,
  FileUp, Filter, Folder, Gauge, HardDrive, Layers3, LayoutDashboard, Menu,
  MessageSquare, MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck,
  Sparkles, UploadCloud, X, Zap, Clock3, Trash2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const initialDocs = [
  { id: 1, name: 'System Architecture Overview.pdf', type: 'PDF', category: 'Engineering', size: '2.4 MB', date: 'Today', chunks: 24, status: 'Indexed', color: 'violet', summary: 'Architecture decisions, service boundaries, data flow, and infrastructure overview.' },
  { id: 2, name: 'Product Strategy Q3.docx', type: 'DOCX', category: 'Product', size: '840 KB', date: 'Yesterday', chunks: 18, status: 'Indexed', color: 'blue', summary: 'Product priorities, target personas, quarterly outcomes, and roadmap assumptions.' },
  { id: 3, name: 'Meeting Notes — AI Platform.md', type: 'MD', category: 'Research', size: '32 KB', date: 'Nov 6, 2026', chunks: 9, status: 'Indexed', color: 'green', summary: 'Discussion notes covering retrieval quality, evaluation, and the ingestion pipeline.' },
  { id: 4, name: 'API Design Guidelines.pdf', type: 'PDF', category: 'Engineering', size: '1.1 MB', date: 'Nov 4, 2026', chunks: 31, status: 'Indexed', color: 'orange', summary: 'REST API conventions, error handling, pagination, versioning, and security.' },
  { id: 5, name: 'Research Paper — Vector Search.pdf', type: 'PDF', category: 'Research', size: '3.8 MB', date: 'Nov 2, 2026', chunks: 42, status: 'Processing', color: 'violet', summary: 'A research paper about approximate nearest-neighbour search and vector indexing.' },
];

const starterMessages = [
  { role: 'assistant', text: 'Hey there! I’m your MindVault assistant. Ask me anything about the knowledge you’ve added to your vault.', sources: [] }
];

function readDocs() {
  try { return JSON.parse(localStorage.getItem('mindvault-docs')) || initialDocs; }
  catch { return initialDocs; }
}

function App() {
  const [page, setPage] = useState('Overview');
  const [docs, setDocs] = useState(readDocs);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All files');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState(starterMessages);
  const [chatInput, setChatInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('Content');
  const fileRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => localStorage.setItem('mindvault-docs', JSON.stringify(docs)), [docs]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const filteredDocs = useMemo(() => docs.filter(d => {
    const matchesQuery = `${d.name} ${d.category} ${d.summary}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All files' || d.category === filter;
    return matchesQuery && matchesFilter;
  }), [docs, query, filter]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const handleFiles = (files) => {
    const additions = Array.from(files || []).map((file, i) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      return {
        id: Date.now() + i, name: file.name, type: ext, category: 'Unsorted',
        size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        date: 'Just now', chunks: 0, status: 'Queued', color: 'blue',
        summary: 'Uploaded locally. Connect the ingestion API to extract text, create chunks, and generate embeddings.'
      };
    });
    if (additions.length) {
      setDocs(prev => [...additions, ...prev]);
      setUploadOpen(false);
      setPage('Knowledge Vault');
      notify(`${additions.length} file${additions.length > 1 ? 's' : ''} added to your vault`);
    }
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }, {
      role: 'assistant',
      text: 'I can help answer this once MindVault is connected to its document-processing and retrieval backend. The current frontend is running in demo mode, so no real documents are being searched yet.',
      sources: []
    }]);
    setChatInput('');
  };

  const navGroups = [
    { label: 'WORKSPACE', items: [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Knowledge Vault', icon: BookOpen }, { name: 'AI Assistant', icon: MessageSquare }, { name: 'Smart Search', icon: Search }] },
    { label: 'MANAGE', items: [{ name: 'Collections', icon: Folder }, { name: 'Processing', icon: Layers3 }] }
  ];

  const go = (name) => { setPage(name); setSelectedDoc(null); };
  const totalChunks = docs.reduce((sum, d) => sum + d.chunks, 0);
  const indexed = docs.filter(d => d.status === 'Indexed').length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <div className="brand-row">
          <div className="brand-mark"><Brain size={21} /></div>
          {sidebarOpen && <div className="brand-copy"><strong>mindvault</strong><span>PERSONAL KNOWLEDGE OS</span></div>}
          <button className="icon-btn collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
        </div>
        <button className="workspace-switch">
          <div className="workspace-avatar">S</div>
          {sidebarOpen && <><span><b>Personal workspace</b><small>Free plan</small></span><ChevronDown size={15} /></>}
        </button>
        {navGroups.map(group => <div className="nav-group" key={group.label}>
          {sidebarOpen && <div className="nav-label">{group.label}</div>}
          {group.items.map(item => {
            const Icon = item.icon;
            return <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => go(item.name)} title={item.name}>
              <Icon size={18} /><span>{sidebarOpen && item.name}</span>{sidebarOpen && item.name === 'AI Assistant' && <span className="nav-new">AI</span>}
            </button>;
          })}
        </div>)}
        <div className="sidebar-bottom">
          <div className="storage-card">
            <div className="storage-top"><HardDrive size={15}/>{sidebarOpen && <span>Vault storage</span>} {sidebarOpen && <b>24%</b>}</div>
            {sidebarOpen && <><div className="progress"><span style={{width:'24%'}} /></div><small>240 MB of 1 GB used</small></>}
          </div>
          <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => go('Settings')}><Settings size={18}/>{sidebarOpen && <span>Settings</span>}</button>
          <div className="profile-row"><div className="profile-avatar">SG</div>{sidebarOpen && <div><b>Your workspace</b><small>Personal account</small></div>}{sidebarOpen && <MoreHorizontal size={18} className="muted-icon"/>}</div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{selectedDoc ? selectedDoc.name : page}</b></div>
          <div className="top-actions">
            <div className="search-global"><Search size={16}/><input value={query} onChange={e => {setQuery(e.target.value); if(page !== 'Knowledge Vault') setPage('Knowledge Vault');}} placeholder="Search your vault..." /><kbd>⌘ K</kbd></div>
            <button className="icon-btn help-btn" title="Help"><CircleHelp size={18}/></button>
            <div className="top-avatar">SG</div>
          </div>
        </header>

        <div className="page-content">
          {selectedDoc ? <DocumentDetail doc={selectedDoc} onBack={() => setSelectedDoc(null)} activeTab={activeTab} setActiveTab={setActiveTab} /> :
          page === 'Overview' ? <Overview docs={docs} totalChunks={totalChunks} indexed={indexed} onUpload={() => setUploadOpen(true)} onOpenDoc={setSelectedDoc} onNavigate={go} /> :
          page === 'Knowledge Vault' ? <Vault docs={filteredDocs} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onUpload={() => setUploadOpen(true)} onOpenDoc={setSelectedDoc} onDelete={id => {setDocs(prev => prev.filter(d => d.id !== id)); notify('Document removed from your vault');}} /> :
          page === 'AI Assistant' ? <Assistant messages={messages} input={chatInput} setInput={setChatInput} onSend={sendMessage} chatEndRef={chatEndRef} /> :
          page === 'Smart Search' ? <SmartSearch query={query} setQuery={setQuery} docs={docs} onOpenDoc={setSelectedDoc} /> :
          page === 'Collections' ? <Collections docs={docs} onNavigate={go} /> :
          page === 'Processing' ? <Processing docs={docs} /> :
          <SettingsPage notify={notify} /> }
        </div>
      </main>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onFiles={handleFiles} fileRef={fileRef} />}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function PrimaryButton({ children, onClick, icon: Icon = Plus }) {
  return <button className="primary-btn" onClick={onClick}><Icon size={16}/>{children}</button>;
}
function StatCard({ icon: Icon, label, value, change, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot"><span className="stat-change"><ArrowUpRight size={13}/>{change}</span><span>vs. last month</span></div></div>;
}
function FileGlyph({ type }) {
  const color = type === 'PDF' ? 'pdf' : type === 'DOCX' ? 'doc' : type === 'MD' ? 'md' : 'other';
  return <div className={`file-glyph ${color}`}>{type === 'PDF' ? <FileText size={19}/> : type === 'MD' ? <FileCode2 size={19}/> : <File size={19}/>}</div>;
}
function Overview({ docs, totalChunks, indexed, onUpload, onOpenDoc, onNavigate }) {
  return <>
    <PageHeading eyebrow="YOUR KNOWLEDGE, IN ONE PLACE" title="Good evening 👋" description="Here's what's happening inside your personal knowledge vault." action={<PrimaryButton onClick={onUpload} icon={UploadCloud}>Add knowledge</PrimaryButton>} />
    <div className="stats-grid">
      <StatCard icon={FileText} label="Total documents" value={docs.length.toString().padStart(2,'0')} change="+12.5%" tone="purple"/>
      <StatCard icon={Layers3} label="Knowledge chunks" value={totalChunks.toString()} change="+8.2%" tone="blue"/>
      <StatCard icon={Brain} label="Indexed & ready" value={indexed.toString()} change="+4.3%" tone="green"/>
      <StatCard icon={Zap} label="AI queries" value="128" change="+18.6%" tone="orange"/>
    </div>
    <div className="overview-grid">
      <section className="panel recent-panel">
        <div className="panel-heading"><div><h2>Recently added</h2><p>Your latest knowledge sources</p></div><button className="text-btn" onClick={() => onNavigate('Knowledge Vault')}>View all <ArrowRight size={14}/></button></div>
        <div className="doc-list">
          {docs.slice(0,4).map(doc => <DocumentRow key={doc.id} doc={doc} onClick={() => onOpenDoc(doc)}/>)}
        </div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-heading"><div><h2>Knowledge activity</h2><p>Your vault at a glance</p></div><button className="icon-btn"><MoreHorizontal size={18}/></button></div>
        <div className="activity-chart">
          <div className="chart-summary"><strong>+24%</strong><span>knowledge growth</span></div>
          <div className="bars">{[28,42,35,56,43,66,51,75,60,88,69,96].map((h,i)=><div key={i} className="bar-wrap"><div className={`bar ${i===11?'bar-current':''}`} style={{height:`${h}%`}}/></div>)}</div>
          <div className="chart-labels"><span>Oct 20</span><span>Oct 27</span><span>Nov 03</span><span>Nov 09</span></div>
        </div>
        <div className="activity-divider"/>
        <div className="activity-row"><span className="activity-dot purple-dot"/><span>Documents indexed</span><b>{docs.filter(d=>d.status==='Indexed').length}</b></div>
        <div className="activity-row"><span className="activity-dot blue-dot"/><span>Chunks generated</span><b>{totalChunks}</b></div>
        <div className="activity-row"><span className="activity-dot orange-dot"/><span>Awaiting processing</span><b>{docs.filter(d=>d.status!=='Indexed').length}</b></div>
      </section>
    </div>
    <section className="ai-banner">
      <div className="ai-banner-icon"><Sparkles size={23}/></div>
      <div className="ai-banner-copy"><span className="banner-kicker">YOUR SECOND BRAIN, READY</span><h2>Have a question? Your knowledge has answers.</h2><p>Ask naturally. MindVault will find relevant context across your documents.</p></div>
      <button className="banner-btn" onClick={() => onNavigate('AI Assistant')}>Chat with your vault <ArrowUpRight size={16}/></button>
      <div className="banner-orb orb-one"/><div className="banner-orb orb-two"/>
    </section>
  </>;
}
function DocumentRow({ doc, onClick }) {
  return <button className="doc-row" onClick={onClick}><FileGlyph type={doc.type}/><div className="doc-info"><b>{doc.name}</b><span>{doc.category} <i>·</i> {doc.size}</span></div><div className={`status ${doc.status.toLowerCase()}`}>{doc.status === 'Indexed' && <span/>}{doc.status}</div><span className="doc-date">{doc.date}</span><ChevronRight size={16} className="row-chevron"/></button>;
}
function Vault({ docs, query, setQuery, filter, setFilter, onUpload, onOpenDoc, onDelete }) {
  const categories = ['All files','Engineering','Product','Research','Unsorted'];
  return <>
    <PageHeading eyebrow="YOUR LIBRARY" title="Knowledge vault" description="All your knowledge sources, organized and ready to explore." action={<PrimaryButton onClick={onUpload} icon={UploadCloud}>Upload documents</PrimaryButton>}/>
    <div className="vault-toolbar"><div className="vault-tabs">{categories.map(c=><button key={c} className={filter===c?'selected':''} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="vault-controls"><div className="inline-search"><Search size={15}/><input placeholder="Filter documents..." value={query} onChange={e=>setQuery(e.target.value)}/></div><button className="outline-btn"><Filter size={15}/> Filters</button></div></div>
    <section className="panel vault-table-panel"><div className="table-head"><span>NAME</span><span>CATEGORY</span><span>STATUS</span><span>SIZE</span><span>ADDED</span><span/></div>
      {docs.length ? docs.map(doc=><div className="table-row" key={doc.id}><button className="table-name" onClick={()=>onOpenDoc(doc)}><FileGlyph type={doc.type}/><span><b>{doc.name}</b><small>{doc.type} document</small></span></button><span className="category-pill">{doc.category}</span><span><span className={`status ${doc.status.toLowerCase()}`}>{doc.status==='Indexed'&&<span/>}{doc.status}</span></span><span className="table-muted">{doc.size}</span><span className="table-muted">{doc.date}</span><button className="icon-btn delete-btn" title="Delete document" onClick={()=>onDelete(doc.id)}><Trash2 size={15}/></button></div>) : <div className="empty-state"><Search size={25}/><b>No documents found</b><span>Try a different search or category.</span></div>}
      <div className="table-footer">Showing <b>{docs.length}</b> documents <span>Demo data is stored in this browser.</span></div>
    </section>
  </>;
}
function Assistant({ messages, input, setInput, onSend, chatEndRef }) {
  return <>
    <PageHeading eyebrow="MINDVAULT AI" title="AI assistant" description="A conversation with everything you've saved." action={<div className="model-chip"><span/> Demo assistant <ChevronDown size={13}/></div>}/>
    <div className="chat-layout">
      <section className="panel chat-panel">
        <div className="chat-topline"><div className="assistant-avatar"><Sparkles size={17}/></div><div><b>MindVault Assistant</b><span><i/> Ready to help</span></div><button className="icon-btn"><MoreHorizontal size={18}/></button></div>
        <div className="chat-messages">
          <div className="date-divider"><span>Today</span></div>
          {messages.map((m,i)=><div key={i} className={`message ${m.role}`}><div className="message-avatar">{m.role==='assistant'?<Sparkles size={15}/>: 'SG'}</div><div className="message-content"><div className="message-author">{m.role==='assistant'?'MindVault':'You'} <span>{m.role==='assistant'?'AI assistant':'Just now'}</span></div><p>{m.text}</p>{m.sources?.length>0&&<div className="source-chip"><FileText size={13}/> {m.sources.join(', ')}</div>}</div></div>)}
          <div ref={chatEndRef}/>
        </div>
        <div className="chat-composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();onSend();}}} placeholder="Ask anything about your knowledge..." rows={2}/><div className="composer-bottom"><span><Sparkles size={13}/> Answers are grounded in your vault when connected</span><button className="send-btn" onClick={onSend} disabled={!input.trim()}><Send size={16}/></button></div></div>
      </section>
      <aside className="chat-side"><div className="panel prompt-panel"><h3><Sparkles size={16}/> Try asking</h3>{['Summarize my latest notes','What are the key architecture decisions?','Find documents about vector search','What should I follow up on?'].map((p,i)=><button key={i} onClick={()=>setInput(p)}>{p}<ArrowUpRight size={14}/></button>)}</div><div className="panel chat-info"><div className="info-icon"><ShieldCheck size={19}/></div><b>Your knowledge stays yours</b><p>Connect your backend to enable authenticated retrieval and source-grounded answers.</p></div></aside>
    </div>
  </>;
}
function SmartSearch({ query, setQuery, docs, onOpenDoc }) {
  const results = query ? docs.filter(d=>`${d.name} ${d.summary} ${d.category}`.toLowerCase().includes(query.toLowerCase())) : [];
  return <><PageHeading eyebrow="DISCOVER CONNECTIONS" title="Smart search" description="Find knowledge by meaning, topic, or phrase."/><div className="search-hero"><div className="search-hero-icon"><Search size={22}/></div><h2>What are you looking for?</h2><p>Search across your personal knowledge base.</p><div className="big-search"><Search size={19}/><input autoFocus placeholder="Try “API authentication patterns”..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>ENTER</kbd></div><div className="search-hints"><span>Try:</span>{['architecture','vector search','product strategy'].map(t=><button key={t} onClick={()=>setQuery(t)}>{t}</button>)}</div></div>{query&&<section className="panel search-results"><div className="panel-heading"><div><h2>Search results</h2><p>{results.length} matching documents · keyword demo</p></div></div>{results.map(d=><DocumentRow key={d.id} doc={d} onClick={()=>onOpenDoc(d)}/>)}</section>}</>;
}
function DocumentDetail({ doc, onBack, activeTab, setActiveTab }) {
  return <><button className="back-link" onClick={onBack}><ArrowDown size={14}/> Back to vault</button><div className="detail-heading"><FileGlyph type={doc.type}/><div><div className="eyebrow">DOCUMENT DETAILS</div><h1>{doc.name}</h1><p>{doc.category} · {doc.size} · Added {doc.date}</p></div><span className={`status ${doc.status.toLowerCase()}`}>{doc.status}</span></div><div className="detail-tabs">{['Content','Chunks','Metadata'].map(t=><button className={activeTab===t?'active':''} key={t} onClick={()=>setActiveTab(t)}>{t}</button>)}</div><section className="panel detail-panel">{activeTab==='Content'?<><h2>Document overview</h2><p>{doc.summary}</p><div className="placeholder-content"><FileText size={25}/><b>Document preview will appear here</b><span>Connect the document extraction API to display the original content.</span></div></>:activeTab==='Chunks'?<><div className="panel-heading"><div><h2>Generated chunks</h2><p>{doc.chunks} chunks · Smart chunking preview</p></div><span className="category-pill">Recursive strategy</span></div>{Array.from({length:Math.min(doc.chunks||3,4)},(_,i)=><div className="chunk-card" key={i}><div><b>Chunk {String(i+1).padStart(2,'0')}</b><span>Tokens: 420 · Overlap: 60</span></div><p>{i===0?doc.summary:'This section contains extracted document content. Semantic boundaries and metadata will be preserved during ingestion.'}</p></div>)}</>:<><h2>Document metadata</h2>{[['File name',doc.name],['File type',doc.type],['Category',doc.category],['File size',doc.size],['Added',doc.date],['Chunk count',doc.chunks],['Indexing status',doc.status]].map(([k,v])=><div className="metadata-row" key={k}><span>{k}</span><b>{v}</b></div>)}</>}</section></>;
}
function Collections({ docs, onNavigate }) {
  const cats = ['Engineering','Product','Research','Unsorted'];
  const tones = ['violet','blue','green','orange'];
  return <><PageHeading eyebrow="ORGANIZE YOUR THINKING" title="Collections" description="Group related documents into focused knowledge spaces." action={<PrimaryButton onClick={()=>onNavigate('Knowledge Vault')}>Browse documents</PrimaryButton>}/><div className="collection-grid">{cats.map((c,i)=><button className="collection-card" key={c} onClick={onNavigate.bind(null,'Knowledge Vault')}><div className={`collection-icon ${tones[i]}`}><Folder size={20}/></div><b>{c}</b><span>{docs.filter(d=>d.category===c).length} documents</span><div className="collection-foot"><span>Open collection</span><ArrowUpRight size={15}/></div></button>)}</div></>;
}
function Processing({ docs }) {
  const queued = docs.filter(d=>d.status!=='Indexed');
  return <><PageHeading eyebrow="INGESTION PIPELINE" title="Processing" description="Monitor document extraction, chunking, and indexing jobs."/><div className="stats-grid two-stats"><StatCard icon={Activity} label="Active jobs" value={queued.length.toString()} change="Live queue" tone="blue"/><StatCard icon={Check} label="Completed" value={docs.filter(d=>d.status==='Indexed').length.toString()} change="All time" tone="green"/></div><section className="panel processing-panel"><div className="panel-heading"><div><h2>Recent jobs</h2><p>Document ingestion status</p></div></div>{docs.map(d=><div className="job-row" key={d.id}><FileGlyph type={d.type}/><div><b>{d.name}</b><span>{d.status==='Indexed'?'Extraction → Chunking → Embeddings → Indexed':'Waiting for backend ingestion worker'}</span></div><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span></div>)}</section></>;
}
function SettingsPage({ notify }) {
  return <><PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="Manage your workspace and AI preferences."/><div className="settings-layout"><section className="panel settings-panel"><h2>Workspace preferences</h2><div className="setting-row"><div><b>Workspace name</b><span>Your personal knowledge space</span></div><input defaultValue="Personal workspace"/></div><div className="setting-row"><div><b>Default chunking strategy</b><span>Used when processing new documents</span></div><select defaultValue="recursive"><option value="recursive">Recursive</option><option value="semantic">Semantic</option><option value="fixed">Fixed size</option></select></div><div className="setting-row"><div><b>Chunk overlap</b><span>Context retained between adjacent chunks</span></div><select defaultValue="10"><option value="5">5%</option><option value="10">10%</option><option value="15">15%</option><option value="20">20%</option></select></div><button className="primary-btn save-btn" onClick={()=>notify('Preferences saved in this demo')}>Save preferences</button></section><section className="panel settings-panel"><h2>AI configuration</h2><div className="config-note"><Sparkles size={17}/><div><b>Backend connection required</b><span>LLM, embedding, and vector database settings will be securely managed by the backend.</span></div></div><div className="setting-row"><div><b>API connection</b><span>MindVault backend endpoint</span></div><span className="status queued">Not connected</span></div></section></div></>;
}
function UploadModal({ onClose, onFiles }) {
  const [drag, setDrag] = useState(false);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="upload-modal"><div className="modal-heading"><div><h2>Add to your vault</h2><p>Bring your knowledge together in one place.</p></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><div className={`dropzone ${drag?'dragging':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);onFiles(e.dataTransfer.files);}}><div className="upload-icon"><UploadCloud size={25}/></div><b>Drag and drop your files here</b><span>or browse files from your computer</span><label className="outline-btn browse-btn">Browse files<input type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,.csv" onChange={e=>onFiles(e.target.files)}/></label><small>PDF, DOCX, TXT, MD, CSV · Max 20 MB per file</small></div><div className="upload-foot"><ShieldCheck size={15}/> Files are currently added to this browser demo only.</div></div></div>;
}

export default App;
