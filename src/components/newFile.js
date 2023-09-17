import { useEditor, Editor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';

export default (await import('vue')).defineComponent({
  components: {
    Toolbar,
    EditorContent,
  },

  data() {
    return {
      content: '<p>Здесь ваш текст...</p>',
    };
  },

  setup() {
    const editor = useEditor({
      content: '<p>Редактор на Vue.js с Tiptap 🎉</p>',
      extensions: [StarterKit],
    });

    return { editor };
  },

  methods: {
    // Обработчик горячих клавиш
    handleKeyDown(event) {
      if (event.ctrlKey && event.key === 'z') {
        this.handleUndo();
      } else if (event.ctrlKey && event.key === 'y') {
        this.handleRedo();
      }
    },

    handleUndo() {
      this.editor.commands.undo();
    },

    handleRedo() {
      this.editor.commands.redo();
    },

    // Улучшенное добавление заголовка
    handleToggleHeading() {
      // this.editor.chain().focus('start').newlineInCode().toggleHeading({ level: 1 }).run()
    },

    // Улучшенное добавление абзаца
    handleToggleParagraph() {
      // const { tr, doc, selection } = this.editor.state
      // const { $from } = selection
      // const fromLine = doc.nodeAt($from.before())
      // const previousText = fromLine.textContent
      // const newText = previousText ? `${previousText}.` : ''
      const selection = this.editor.view.state.selection;

      // Проверьте, есть ли что-то выделенное
      if (!selection.empty) {
        // Получите начальную и конечную позиции выделения
        const { from, to } = selection;

        // Создайте новый абзац с текстом из выделенного фрагмента
        const paragraphNode =
          this.editor.view.state.schema.nodes.paragraph.create(
            {},
            this.editor.view.state.doc.slice(from, to).content
          );

        // Создайте элемент переноса строки
        const lineBreak = this.editor.view.state.schema.text('\n');

        // Создайте транзакцию для замены выделенного фрагмента на параграф с переносом строки
        const transaction = this.editor.view.state.tr.replaceRangeWith(
          from,
          to,
          [lineBreak, paragraphNode]
        );

        // Примените транзакцию к редактору
        this.editor.view.dispatch(transaction);
      } else {
        console.log('Ничего не выделено.');
      }
    },

    // Улучшенная загрузка изображения
    handleUploadImage() {
      const imageUrl = prompt('Введите URL изображения:');
      if (imageUrl) {
        const imageNode = this.editor
          .chain()
          .focus()
          .setImage({ src: imageUrl })
          .run();
        this.editor.commands.setContent(imageNode);
      }
    },

    // Улучшенное копирование в буфер обмена
    handleCopyToClipboard() {
      const range = document.createRange();
      range.selectNodeContents(this.$refs.content);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      // Добавим подсказку о копировании
      alert('Текст скопирован в буфер обмена');
    },
  },

  watch: {
    content(value) {
      if (this.editor && this.editor.getHTML() !== value) {
        this.editor.commands.setContent(value);
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Document,
        Paragraph,
        Text,
        Image,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        Dropcursor,
      ],
      content: this.content,
      onUpdate: () => {
        this.content = this.editor.getHTML();
      },
    });
  },

  beforeUnmount() {
    this.editor.destroy();
  },
});
