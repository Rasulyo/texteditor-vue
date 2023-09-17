<!-- eslint-disable vue/multi-word-component-names -->
<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
  components: {
    EditorContent,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  emits: ['update:modelValue'],

  data() {
    return {
      editor: null,
      content: '',
    }
  },

  methods: {
    undo() {
      this.editor.commands.undo()
    },

    redo() {
      this.editor.commands.redo()
    },

    toggleHeading() {
      this.editor.chain().focus().toggleHeading().run()
    },

    toggleParagraph() {
      this.editor.chain().focus().toggleParagraph().run()
    },

    uploadImage() {
      const imageUrl = prompt('Введите URL изображения:')
      if (imageUrl) {
        this.editor.chain().focus().setImage({ src: imageUrl }).run()
      }
    },

    copyToClipboard() {
      const range = document.createRange()
      range.selectNodeContents(this.$refs.content)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('copy')
      selection.removeAllRanges()
    },
  },

  watch: {
    modelValue(value) {
      if (this.editor && this.editor.getHTML() !== value) {
        this.editor.commands.setContent(value)
      }
    },
  },

  mounted() {
    this.editor = new Editor({
      extensions: [
        StarterKit,
      ],
      content: this.modelValue,
      onUpdate: () => {
        this.content = this.editor.getHTML()
        this.$emit('update:modelValue', this.content)
      },
    })
  },

  beforeUnmount() {
    this.editor.destroy()
  },
}
</script>
