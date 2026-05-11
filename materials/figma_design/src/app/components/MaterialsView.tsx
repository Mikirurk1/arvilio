import { Plus, FileText, Presentation, BookOpen, ExternalLink, Trash2, Link as LinkIcon, Volume2, Grid3x3, List } from 'lucide-react';
import { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';

interface Material {
  id: string;
  name: string;
  type: 'board' | 'presentation' | 'book';
  url?: string;
  studentBook?: {
    url: string;
    audio?: string;
  };
  workbook?: {
    url: string;
    audio?: string;
  };
}

export function MaterialsView() {
  const [activeTab, setActiveTab] = useState<'all' | 'board' | 'presentation' | 'book'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [materials, setMaterials] = useState<Material[]>([
    { id: '1', name: 'Grammar Basics', type: 'board', url: 'https://miro.com/board/example' },
    { id: '2', name: 'Business English Presentation', type: 'presentation', url: 'https://docs.google.com/presentation/d/example' },
    {
      id: '3',
      name: 'English File Intermediate',
      type: 'book',
      studentBook: { url: 'https://elt.oup.com/student/englishfile', audio: 'https://elt.oup.com/student/englishfile/audio' },
      workbook: { url: 'https://elt.oup.com/student/englishfile/workbook', audio: 'https://elt.oup.com/student/englishfile/workbook/audio' }
    },
    { id: '4', name: 'Vocabulary Practice Board', type: 'board', url: 'https://miro.com/board/vocab' },
    { id: '5', name: 'Pronunciation Guide', type: 'presentation', url: 'https://docs.google.com/presentation/d/pronunciation' },
    { id: '6', name: 'Business Scenarios', type: 'board', url: 'https://miro.com/board/business' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'board' | 'presentation' | 'book'>('board');
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    url: '',
    studentBookUrl: '',
    studentBookAudio: '',
    workbookUrl: '',
    workbookAudio: ''
  });

  const filteredMaterials = activeTab === 'all' ? materials : materials.filter(m => m.type === activeTab);
  const boardCount = materials.filter(m => m.type === 'board').length;
  const presentationCount = materials.filter(m => m.type === 'presentation').length;
  const bookCount = materials.filter(m => m.type === 'book').length;

  const handleAddMaterial = () => {
    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name,
      type: selectedType,
    };

    if (selectedType === 'book') {
      material.studentBook = { url: newMaterial.studentBookUrl, audio: newMaterial.studentBookAudio };
      material.workbook = { url: newMaterial.workbookUrl, audio: newMaterial.workbookAudio };
    } else {
      material.url = newMaterial.url;
    }

    setMaterials([...materials, material]);
    setShowAddModal(false);
    setNewMaterial({ name: '', url: '', studentBookUrl: '', studentBookAudio: '', workbookUrl: '', workbookAudio: '' });
  };

  const renderMaterialCard = (material: Material) => {
    const isBook = material.type === 'book';
    const gridClass = isBook && viewMode === 'grid' ? 'col-span-2' : '';

    const getTypeColor = () => {
      if (material.type === 'board') return { bg: '#e8f0fb', text: '#3b82c4', icon: FileText };
      if (material.type === 'presentation') return { bg: '#eeedfe', text: '#7c6ee6', icon: Presentation };
      return { bg: '#e8f7f2', text: '#16a97a', icon: BookOpen };
    };

    const { bg, text, icon: Icon } = getTypeColor();

    if (viewMode === 'list') {
      return (
        <div key={material.id} className="bg-white rounded-xl p-5 transition-all group flex items-center gap-4" style={{ border: '1px solid rgba(26, 26, 46, 0.06)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
            <Icon className="w-6 h-6" style={{ color: text }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: '#1a1a2e' }}>{material.name}</h3>
            <div className="flex items-center gap-3">
              {isBook ? (
                <>
                  {material.studentBook && (
                    <span className="text-xs" style={{ color: '#7a7a9a' }}>Student Book{material.studentBook.audio && ' + Audio'}</span>
                  )}
                  {material.workbook && (
                    <>
                      <span className="text-xs" style={{ color: '#b4b4cc' }}>·</span>
                      <span className="text-xs" style={{ color: '#7a7a9a' }}>Workbook{material.workbook.audio && ' + Audio'}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs" style={{ color: '#7a7a9a' }}>{material.type}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isBook && material.url && (
              <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all" style={{ color: text, backgroundColor: `${bg}` }}>
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            )}
            {isBook && (
              <div className="flex items-center gap-2">
                {material.studentBook && (
                  <a href={material.studentBook.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-xs" style={{ color: text, backgroundColor: bg }}>
                    Student Book
                  </a>
                )}
                {material.workbook && (
                  <a href={material.workbook.url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg text-xs" style={{ color: text, backgroundColor: bg }}>
                    Workbook
                  </a>
                )}
              </div>
            )}
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg" style={{ color: '#e05c7a' }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div key={material.id} className={`bg-white rounded-xl p-5 transition-all group ${gridClass}`} style={{ border: '1px solid rgba(26, 26, 46, 0.06)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
        {!isBook ? (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="w-6 h-6" style={{ color: text }} />
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg" style={{ color: '#e05c7a' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: '#1a1a2e' }}>{material.name}</h3>
            {material.url && (
              <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm transition-all px-3 py-2 rounded-lg" style={{ color: text, backgroundColor: `${bg}80` }}>
                <ExternalLink className="w-4 h-4" />
                Open {material.type === 'board' ? 'Board' : 'Presentation'}
              </a>
            )}
          </>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                  <BookOpen className="w-7 h-7" style={{ color: text }} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#1a1a2e' }}>{material.name}</h3>
                  <p className="text-xs" style={{ color: '#7a7a9a' }}>Complete course materials</p>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg" style={{ color: '#e05c7a' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {material.studentBook && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#3d3d55' }}>Student Book</div>
                  <div className="flex items-center gap-2">
                    <a href={material.studentBook.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg" style={{ color: '#16a97a', backgroundColor: '#e8f7f2' }}>
                      <LinkIcon className="w-3 h-3" />
                      Book
                    </a>
                    {material.studentBook.audio && (
                      <a href={material.studentBook.audio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg" style={{ color: '#7c6ee6', backgroundColor: '#eeedfe' }}>
                        <Volume2 className="w-3 h-3" />
                        Audio
                      </a>
                    )}
                  </div>
                </div>
              )}

              {material.workbook && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#fafafa' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#3d3d55' }}>Workbook</div>
                  <div className="flex items-center gap-2">
                    <a href={material.workbook.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg" style={{ color: '#16a97a', backgroundColor: '#e8f7f2' }}>
                      <LinkIcon className="w-3 h-3" />
                      Book
                    </a>
                    {material.workbook.audio && (
                      <a href={material.workbook.audio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg" style={{ color: '#7c6ee6', backgroundColor: '#eeedfe' }}>
                        <Volume2 className="w-3 h-3" />
                        Audio
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
        <GlobalSearch />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: '#fafafa' }}>
            <button onClick={() => setViewMode('grid')} className="p-2 rounded-lg transition-all" style={{ backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent', color: viewMode === 'grid' ? '#1a1a2e' : '#7a7a9a' }}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className="p-2 rounded-lg transition-all" style={{ backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent', color: viewMode === 'list' ? '#1a1a2e' : '#7a7a9a' }}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white transition-all" style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)', boxShadow: '0 4px 12px rgba(22, 169, 122, 0.25)' }}>
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e' }}>Materials</h1>
            <p className="text-sm" style={{ color: '#7a7a9a' }}>Organize and manage your teaching resources</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setActiveTab('all')} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ backgroundColor: activeTab === 'all' ? '#1a1a2e' : '#ffffff', color: activeTab === 'all' ? '#ffffff' : '#3d3d55', border: '1px solid rgba(26, 26, 46, 0.08)' }}>
              All Materials · {materials.length}
            </button>
            <button onClick={() => setActiveTab('board')} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2" style={{ backgroundColor: activeTab === 'board' ? '#e8f0fb' : '#ffffff', color: activeTab === 'board' ? '#3b82c4' : '#3d3d55', border: activeTab === 'board' ? '1px solid #3b82c4' : '1px solid rgba(26, 26, 46, 0.08)' }}>
              <FileText className="w-4 h-4" />
              Boards · {boardCount}
            </button>
            <button onClick={() => setActiveTab('presentation')} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2" style={{ backgroundColor: activeTab === 'presentation' ? '#eeedfe' : '#ffffff', color: activeTab === 'presentation' ? '#7c6ee6' : '#3d3d55', border: activeTab === 'presentation' ? '1px solid #7c6ee6' : '1px solid rgba(26, 26, 46, 0.08)' }}>
              <Presentation className="w-4 h-4" />
              Presentations · {presentationCount}
            </button>
            <button onClick={() => setActiveTab('book')} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2" style={{ backgroundColor: activeTab === 'book' ? '#e8f7f2' : '#ffffff', color: activeTab === 'book' ? '#16a97a' : '#3d3d55', border: activeTab === 'book' ? '1px solid #16a97a' : '1px solid rgba(26, 26, 46, 0.08)' }}>
              <BookOpen className="w-4 h-4" />
              Books · {bookCount}
            </button>
          </div>

          {/* Materials Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-3'}>
            {filteredMaterials.map(renderMaterialCard)}
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1a1a2e]/30 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-[600px] overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(26, 26, 46, 0.12)' }} onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa)' }}>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>Add New Material</h3>
                <p className="text-sm mt-1" style={{ color: '#7a7a9a' }}>Choose type and add details</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ color: '#7a7a9a' }}>
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="px-8 py-4 flex gap-3" style={{ backgroundColor: '#fafafa', borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
              <button onClick={() => setSelectedType('board')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: selectedType === 'board' ? '#e8f0fb' : '#ffffff', color: selectedType === 'board' ? '#3b82c4' : '#7a7a9a', border: selectedType === 'board' ? '1.5px solid #3b82c4' : '1.5px solid rgba(26, 26, 46, 0.08)' }}>
                <FileText className="w-4 h-4" />
                Board
              </button>
              <button onClick={() => setSelectedType('presentation')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: selectedType === 'presentation' ? '#eeedfe' : '#ffffff', color: selectedType === 'presentation' ? '#7c6ee6' : '#7a7a9a', border: selectedType === 'presentation' ? '1.5px solid #7c6ee6' : '1.5px solid rgba(26, 26, 46, 0.08)' }}>
                <Presentation className="w-4 h-4" />
                Presentation
              </button>
              <button onClick={() => setSelectedType('book')} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: selectedType === 'book' ? '#e8f7f2' : '#ffffff', color: selectedType === 'book' ? '#16a97a' : '#7a7a9a', border: selectedType === 'book' ? '1.5px solid #16a97a' : '1.5px solid rgba(26, 26, 46, 0.08)' }}>
                <BookOpen className="w-4 h-4" />
                Book
              </button>
            </div>

            <div className="px-8 py-6 space-y-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d55' }}>Material Name</label>
                <input type="text" value={newMaterial.name} onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} placeholder="Enter material name" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#fafafa', border: '1.5px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
              </div>

              {selectedType !== 'book' && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d55' }}>URL Link</label>
                  <input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: '#fafafa', border: '1.5px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
                </div>
              )}

              {selectedType === 'book' && (
                <>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#e8f7f2' }}>
                    <div className="text-sm font-medium mb-3" style={{ color: '#1a1a2e' }}>Student Book</div>
                    <div className="space-y-3">
                      <input type="url" value={newMaterial.studentBookUrl} onChange={(e) => setNewMaterial({ ...newMaterial, studentBookUrl: e.target.value })} placeholder="Student Book URL" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
                      <input type="url" value={newMaterial.studentBookAudio} onChange={(e) => setNewMaterial({ ...newMaterial, studentBookAudio: e.target.value })} placeholder="Audio URL (optional)" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#e8f7f2' }}>
                    <div className="text-sm font-medium mb-3" style={{ color: '#1a1a2e' }}>Workbook</div>
                    <div className="space-y-3">
                      <input type="url" value={newMaterial.workbookUrl} onChange={(e) => setNewMaterial({ ...newMaterial, workbookUrl: e.target.value })} placeholder="Workbook URL" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
                      <input type="url" value={newMaterial.workbookAudio} onChange={(e) => setNewMaterial({ ...newMaterial, workbookAudio: e.target.value })} placeholder="Audio URL (optional)" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: '#ffffff', border: '1px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-8 py-5 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(26, 26, 46, 0.06)', background: 'linear-gradient(to top, #fafafa, #ffffff)' }}>
              <button onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ border: '1.5px solid rgba(26, 26, 46, 0.15)', color: '#3d3d55' }}>
                Cancel
              </button>
              <button onClick={handleAddMaterial} className="px-6 py-3 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)', boxShadow: '0 4px 12px rgba(22, 169, 122, 0.25)' }}>
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
