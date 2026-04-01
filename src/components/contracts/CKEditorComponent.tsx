import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorComponentProps {
  content: string;
  onChange: (data: string) => void;
  onInit?: (editor: any) => void;
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
          background: rgba(25, 25, 25, 0.9) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 99px !important;
          padding: 5px 15px !important;
          margin-bottom: 20px !important;
          position: sticky !important;
          top: 10px !important;
          z-index: 100 !important;
          display: flex !important;
          justify-content: center !important;
        }
        
        .ck-toolbar__items {
            justify-content: center !important;
        }
        
        .ck-button {
            color: white !important;
            border-radius: 50% !important;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
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
