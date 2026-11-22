import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Highlighter,
  RotateCcw,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  minHeight = '90px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-4 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-4 space-y-1',
          },
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `w-full text-xs text-gray-800 leading-relaxed outline-none p-2.5 focus:outline-none`,
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Keep editor content in sync when value changes externally (e.g. sample data loaded)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
      {/* Mini Formatting Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-1 flex items-center gap-1 flex-wrap text-gray-600">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('highlight') ? 'bg-amber-100 text-amber-800' : ''
          }`}
          title="Highlight text"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-gray-300 mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-gray-300 mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors ml-auto"
          title="Clear Formatting"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
