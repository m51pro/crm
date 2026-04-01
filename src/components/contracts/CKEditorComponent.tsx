import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorComponentProps {
  content: string;
  onChange: (data: string) => void;
  onInit?: (editor: unknown) => void;
}

export function CKEditorComponent({ content, onChange, onInit }: CKEditorComponentProps) {
  return (
    <div className="ck-editor-container prose prose-sm max-w-none">
      <style>{`
        /* Стили для имитации листа A4 */
        .ck-editor__editable {
          min-height: 297mm !important;
          width: 210mm !important;
          margin: 30px auto !important;
          padding: 20mm !important;
          background: white !important;
          color: black !important;
          box-shadow: 0 0 50px rgba(0,0,0,0.5) !important;
          border: none !important;
          line-height: 1.5 !important;
        }

        /* Убираем фокусную рамку */
        .ck-focused {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }

        /* Видимые таблицы в редакторе (Серый пунктир как в Word) */
        .ck-content table {
          border-collapse: collapse !important;
          width: 100% !important;
          border: 1px solid #ddd !important;
        }
        
        .ck-content td, .ck-content th {
          border: 1px solid #eee !important;
          padding: 8px !important;
        }

        /* Скрываем границы в финальном просмотре (если не заданы явно) */
        .prose table, .prose td, .prose th {
          border: none;
        }

        /* Тулбар стилево под темную тему CRM */
        .ck-toolbar {
          background: rgba(20, 20, 22, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 16px !important;
          padding: 4px 8px !important;
          margin-bottom: 20px !important;
          position: sticky !important;
          top: 10px !important;
          z-index: 100 !important;
          display: flex !important;
          justify-content: center !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        
        .ck-toolbar__items {
          justify-content: center !important;
          background: transparent !important;
        }
        
        .ck.ck-button {
          color: rgba(255, 255, 255, 0.7) !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .ck.ck-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .ck.ck-button.ck-on {
          background: rgba(255, 255, 255, 0.15) !important;
          color: #3b82f6 !important;
        }

        /* Исправление для выпадающих списков (Paragraph и др.) */
        .ck.ck-dropdown__button {
          background: transparent !important;
          color: white !important;
        }
        
        .ck.ck-list {
          background: #1a1a1c !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ck.ck-list__item .ck-button {
          color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 0 !important;
        }

        .ck.ck-list__item .ck-button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ck.ck-toolbar__separator {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
      <CKEditor
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        editor={ClassicEditor as any}
        data={content}
        config={{
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
            'insertTable', 'tableColumn', 'tableRow', 'mergeTableCells', '|',
            'undo', 'redo'
          ],
          table: {
            contentToolbar: [
              'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'
            ]
          }
        }}
        onReady={editor => {
          if (onInit) onInit(editor);
        }}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
