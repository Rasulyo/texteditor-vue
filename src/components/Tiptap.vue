<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="wrapper">
    <h3>Редактор</h3>
    <Toolbar
      @undo="handleUndo"
      @redo="handleRedo"
      @toggle-heading="handleToggleHeading"
      @toggle-paragraph="handleToggleParagraph"
      @upload-image="handleUploadImage"
      @copy-to-clipboard="handleCopyToClipboard"
    />
    <div class="editor-wrapper">
      <editor-content :editor="editor" @keydown="handleKeyDown" />
    </div>

    <div class="content" ref="content">
      <!-- <h3>Результат</h3>
      <div v-html="content"></div> -->
    </div>
  </div>
</template>

<script>
import { useEditor, EditorContent, Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar.vue'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

export default {
  components: {
    Toolbar,
    EditorContent
  },

  data() {
    return {
    content: `
      <p>Таким образом консультация с широким активом представляет собой интересный эксперимент проверки позиций, занимаемых участниками в отношении поставленных задач. С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности представляет собой интересный эксперимент проверки форм развития. Идейные соображения высшего порядка, а также укрепление и развитие структуры влечет за собой процесс внедрения и модернизации соответствующий условий активизации. Задача организации, в особенности же реализация намеченных плановых заданий играет важную роль в формировании дальнейших направлений развития. Повседневная практика показывает, что постоянное информационно-пропагандистское обеспечение нашей деятельности играет важную роль в формировании существенных финансовых и административных условий.</p>
      <h3>Смотрите какие обезьянки</h3>
      <img src="https://static-00.iconduck.com/assets.00/vue-js-icon-2048x1766-btrgkrhi.png" alt="Image Description">
      <p>Таким образом консультация с широким активом представляет собой интересный эксперимент проверки позиций, занимаемых участниками в отношении поставленных задач. С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности представляет собой инйцу шо шщйоц ущойц ущошцщйуо йцщуо йщцоу щйоу шщйцош ущйтересный эксперимент проверки форм развития. Идейные соображения высшего порядка, а также укрепление и развитие структуры влечет за собой процесс внедрения и модернизации соответствующий условий активизации. Задача организации, в особенности же реализация намеченных плановых заданий играет важную роль в формировании дальнейших направлений развития. Повседневная практика показывает, что постоянное информационно-пропагандистское обеспечение нашей деятельности играет важную роль в формировании существенных финансовых и административных условий.
      Товарищи! новая модель организационной деятельности требуют от нас анализа направлений прогрессивного развития. Задача организации, в особенности же постоянный количественный рост и сфера нашей активности требуют от нас анализа позиций, занимаемых участниками в отношении поставленных задач. Задача организации, в особенности же реализация намеченных плановых заданий требуют от нас анализа системы обучения кадров, соответствует насущным потребностям.</p>
    `,
  };

  },

  setup() {
    const editor = useEditor({
      content: '<p>Редактор на Vue.js с Tiptap 🎉</p>',
      extensions: [
        StarterKit,
      ],
    })

    return { editor }
  },

  methods: {
    handleKeyDown(event) {
      if (event.ctrlKey && event.key === 'z') {
        this.handleUndo()
      } else if (event.ctrlKey && event.key === 'y') {
        this.handleRedo()
      }
    },

    handleUndo() {
      this.editor.commands.undo()
    },

    handleRedo() {
      this.editor.commands.redo()
    },

    handleToggleHeading() {
      this.editor.chain().focus().newlineInCode().toggleHeading({ level: 1 }).run();
      this.editor.commands.updateAttributes('highlight', { textAlign: 'center' })
    },

    handleToggleParagraph() {
      const selection = this.editor.view.state.selection;
      if (!selection.empty) {
        const { from, to } = selection;
        const paragraphNode = this.editor.view.state.schema.nodes.paragraph.create({}, this.editor.view.state.doc.slice(from, to).content);
        const transaction = this.editor.view.state.tr
          .replaceRangeWith(from, to, paragraphNode);
        this.editor.view.dispatch(transaction);
      } else {
        console.log('Ничего не выделено.');
      }
    },

    handleUploadImage() {
      const imageUrl = prompt('Введите URL изображения:')
      if (imageUrl) {
        this.editor.chain().focus().setImage(
          { src: imageUrl,
            attrs: {
            style: 'width: 500px; height: auto;', // Set the width and maintain the aspect ratio
          }, }
          ).run()
        // const imageNode = this.editor.chain().focus().setImage({ src: imageUrl }).run()
        // this.editor.commands.setContent(imageNode)
      }
    },

    handleCopyToClipboard() {
      const range = document.createRange()
      range.selectNodeContents(this.$refs.content)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('copy')
      selection.removeAllRanges()
      alert('Текст скопирован в буфер обмена')
    },
  },

  watch: {
    content(value) {
      if (this.editor && this.editor.getHTML() !== value) {
        this.editor.commands.setContent(value)
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
        this.content = this.editor.getHTML()
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>


<style lang="scss">
.wrapper {
  background: #000;
  color: #fff;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  
}
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }
}
.ProseMirror-selectednode{
  width: 100% !important;
}
.ProseMirror [contenteditable="false"] {
    white-space: normal;
  width: 100% !important;

}
.centered-heading, .tiptap ProseMirror{
  text-align: center;
}
.content, .editor-wrapper {
  padding: 1rem 0;
  border: 1px solid black;
  max-width: 1000px;
  width: 100%;
  margin-top: 10px;
  padding: 10px;

  h3 {
    margin: 0 auto;
  }
  text-align: justify;
  text-justify: inter-word;
}
</style>
