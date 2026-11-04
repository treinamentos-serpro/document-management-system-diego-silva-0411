import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/api.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    listDocuments()
      .then((result) => {
        if (isCurrent) {
          setDocuments(result);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function refreshDocuments() {
    setIsLoading(true);
    setLoadError('');

    try {
      setDocuments(await listDocuments());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [
      document,
      ...currentDocuments.filter((item) => item.id !== document.id),
    ]);
    setLoadError('');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark">DMS</span>
          <span className="brand-name">Documentos</span>
        </a>
        <span className="storage-status">
          <span className="status-indicator" aria-hidden="true" />
          Armazenamento local
        </span>
      </header>

      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ARQUIVO DIGITAL <span> / </span> 01</p>
            <h1>Seus documentos</h1>
          </div>
          <p className="heading-note">Biblioteca pessoal</p>
        </div>

        <div className="content-layout">
          <section className="upload-panel" aria-labelledby="upload-heading">
            <div className="section-kicker">
              <span className="section-index">01</span>
              <h2 id="upload-heading">Adicionar arquivo</h2>
            </div>
            <UploadComponent onUploaded={handleUploaded} />
          </section>

          <section className="documents-section" aria-labelledby="documents-heading">
            <div className="list-heading">
              <div>
                <p className="eyebrow">BIBLIOTECA <span> / </span> 02</p>
                <h2 id="documents-heading">Documentos</h2>
              </div>
              <button
                className="refresh-button"
                type="button"
                onClick={refreshDocuments}
                disabled={isLoading}
              >
                Atualizar
              </button>
            </div>
            <DocumentList
              documents={documents}
              isLoading={isLoading}
              error={loadError}
              onRetry={refreshDocuments}
            />
          </section>
        </div>
      </main>
    </div>
  );
}