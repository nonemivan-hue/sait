import { useState, useCallback, useRef } from 'react';

interface SearchEngine {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  getUrl: (imageUrl: string) => string;
}

const searchEngines: SearchEngine[] = [
  {
    name: 'Google',
    icon: '🔍',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    getUrl: (imageUrl: string) =>
      `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`,
  },
  {
    name: 'Yandex',
    icon: '🔎',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-200',
    getUrl: (imageUrl: string) =>
      `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`,
  },
  {
    name: 'Bing',
    icon: '🌐',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
    getUrl: (imageUrl: string) =>
      `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=&FORM=SBIHMP&sbisrc=UrlPaste&imgurl=${encodeURIComponent(imageUrl)}`,
  },
  {
    name: 'TinEye',
    icon: '👁️',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
    getUrl: (imageUrl: string) =>
      `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`,
  },
];

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [searchMode, setSearchMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim());
      setImage(null);
    }
  }, [urlInput]);

  const getSearchUrl = (engine: SearchEngine): string => {
    if (searchMode === 'url' && imageUrl) {
      return engine.getUrl(imageUrl);
    }
    // For uploaded images, we need to convert to a URL
    // We'll use a data URL approach or suggest using URL mode
    if (image) {
      // For Google Lens, we can use the upload page
      if (engine.name === 'Google') {
        return 'https://lens.google.com/';
      }
      // For others, suggest pasting URL
      return engine.getUrl('');
    }
    return '#';
  };

  const handleSearch = (engine: SearchEngine) => {
    const url = getSearchUrl(engine);
    if (searchMode === 'upload' && image) {
      // For uploaded images, open the search engine's upload page
      if (engine.name === 'Google') {
        window.open('https://lens.google.com/', '_blank');
      } else if (engine.name === 'Yandex') {
        window.open('https://yandex.com/images/', '_blank');
      } else if (engine.name === 'Bing') {
        window.open('https://www.bing.com/visualsearch', '_blank');
      } else if (engine.name === 'TinEye') {
        window.open('https://tineye.com/', '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageUrl('');
    setUrlInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          🔍 Поиск по фото
        </h1>
        <p className="text-purple-200 text-lg">
          Найдите похожие изображения и источники в интернете
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Mode Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setSearchMode('upload')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                searchMode === 'upload'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              📁 Загрузить фото
            </button>
            <button
              onClick={() => setSearchMode('url')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                searchMode === 'url'
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              🔗 Вставить URL
            </button>
          </div>
        </div>

        {/* Upload Area */}
        {searchMode === 'upload' && (
          <div className="mb-8">
            {!image ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                    : 'border-white/30 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white text-lg">Загрузка...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl">📷</div>
                    <div>
                      <p className="text-white text-xl font-medium mb-2">
                        Перетащите изображение сюда
                      </p>
                      <p className="text-white/60">
                        или нажмите для выбора файла
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                        JPG
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                        PNG
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                        GIF
                      </span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-sm">
                        WebP
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
                <img
                  src={image}
                  alt="Загруженное изображение"
                  className="w-full max-h-96 object-contain rounded-xl"
                />
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-200 text-sm text-center">
                    💡 Для точного поиска загрузите изображение на хостинг (например, Imgur) и используйте режим "Вставить URL"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Input */}
        {searchMode === 'url' && (
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <label className="block text-white font-medium mb-3">
                Вставьте прямую ссылку на изображение:
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
                >
                  Применить
                </button>
              </div>
              {imageUrl && (
                <div className="mt-4 relative">
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                  <img
                    src={imageUrl}
                    alt="Изображение по URL"
                    className="w-full max-h-96 object-contain rounded-xl border border-white/10"
                    onError={() => alert('Не удалось загрузить изображение по указанному URL')}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Engines */}
        {(image || imageUrl) && (
          <div className="animate-fadeIn">
            <h2 className="text-white text-xl font-semibold mb-4 text-center">
              Искать через:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {searchEngines.map((engine) => (
                <button
                  key={engine.name}
                  onClick={() => handleSearch(engine)}
                  className={`group relative p-6 rounded-2xl border-2 ${engine.bgColor} transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {engine.icon}
                    </span>
                    <span className={`font-bold text-lg ${engine.color}`}>
                      {engine.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {engine.name === 'Google' && 'Google Lens'}
                      {engine.name === 'Yandex' && 'Яндекс Картинки'}
                      {engine.name === 'Bing' && 'Visual Search'}
                      {engine.name === 'TinEye' && 'Поиск источников'}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                </button>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> Советы по поиску
              </h3>
              <ul className="text-white/70 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Google Lens</strong> — лучше всего находит похожие объекты, товары и места</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Яндекс Картинки</strong> — отлично ищет лица и людей</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>Bing Visual Search</strong> — хорошо находит изображения в высоком разрешении</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span><strong>TinEye</strong> — находит точные копии и первоисточники изображений</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!image && !imageUrl && searchMode === 'url' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-white/50 text-lg">
              Вставьте URL изображения выше, чтобы начать поиск
            </p>
          </div>
        )}

        {/* Features Section */}
        {!image && !imageUrl && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-2">Точный поиск</h3>
              <p className="text-white/60 text-sm">
                Находите точные копии и похожие изображения в интернете
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-4xl mb-3">🌍</div>
              <h3 className="text-white font-semibold mb-2">4 поисковика</h3>
              <p className="text-white/60 text-sm">
                Google, Yandex, Bing и TinEye — все в одном месте
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-white font-semibold mb-2">Быстро и просто</h3>
              <p className="text-white/60 text-sm">
                Загрузите фото или вставьте ссылку — и ищите за секунды
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 text-white/40 text-sm">
        <p>Reverse Image Search Tool • Загрузка изображений выполняется локально</p>
      </footer>
    </div>
  );
}

export default App;
