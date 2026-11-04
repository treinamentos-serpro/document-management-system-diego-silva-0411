import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${units[unitIndex]}`;
}

function formatUploadDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function DocumentList({ documents, isLoading, error, onRetry }) {
  if (isLoading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (error) {
    return (
      <div className="list-message list-error" role="alert">
        <p>{error}</p>
        <button className="text-button" type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return <p className="list-message">Nenhum documento encontrado.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((document) => (
        <li className="document-row" key={document.id}>
          <div className="document-details">
            <span className="document-name" title={document.originalName}>
              {document.originalName}
            </span>
            <span className="document-meta">
              {formatFileSize(document.size)} <span aria-hidden="true">·</span> {formatUploadDate(document.uploadedAt)}
            </span>
          </div>
          <DownloadButton document={document} />
        </li>
      ))}
    </ul>
  );
}