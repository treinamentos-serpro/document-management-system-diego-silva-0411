import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const document = await uploadDocument(file);
      onUploaded(document);
      setFile(null);
      fileInput.current.value = '';
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="file-picker" htmlFor="document-file">
        <span className="file-picker-label">Arquivo</span>
        <span className="file-picker-name">{file?.name || 'Escolher arquivo...'}</span>
        <input
          ref={fileInput}
          id="document-file"
          type="file"
          onChange={(event) => {
            setFile(event.target.files?.[0] || null);
            setError('');
          }}
        />
      </label>
      <button className="primary-button" type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}